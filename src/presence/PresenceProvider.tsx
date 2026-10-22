import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useSyncExternalStore, type ReactNode } from "react";
import type { ManualPresence, PresenceStatus } from "./PresenceDot";

export interface PresenceProviderProps {
  /** URL de l'API de Volcanium Compte (sans « / » final), ex. `http://localhost:3000`. */
  compteUrl: string;
  /** Identifiant du compte avec lequel l'app est connectee : Compte refuse si le cookie est celui d'un autre compte. */
  userId: string | null | undefined;
  /** Delai sans action avant de passer « inactif ». @default 5 minutes */
  idleAfterMs?: number;
  children: ReactNode;
}

interface PresenceState {
  /** `false` tant que le flux n'est pas ouvert (ou refuse) : les ronds ne s'affichent pas plutot que d'afficher du faux. */
  ready: boolean;
  self: PresenceStatus;
  manual: ManualPresence | null;
  users: Record<string, PresenceStatus>;
  known: ReadonlySet<string>;
}

type ServerEvent =
  | { type: "snapshot"; self: PresenceStatus; manual: ManualPresence | null; users: Record<string, PresenceStatus>; known?: string[] }
  | { type: "status"; userId: string; status: PresenceStatus; manual?: ManualPresence | null };

const INITIAL: PresenceState = { ready: false, self: "offline", manual: null, users: {}, known: new Set() };

export interface PresenceApi {
  /** Mon statut, ou `undefined` si le service est indisponible. */
  self: PresenceStatus | undefined;
  /** Mon choix manuel (`null` = automatique). */
  manual: ManualPresence | null;
  /** Statut d'un utilisateur : `undefined` si on ne peut pas le voir (autre entreprise, service indisponible). */
  statusOf(userId: string | null | undefined): PresenceStatus | undefined;
  /** Change mon statut : `auto` = en ligne (actif / inactif selon l'activite). Applique a toutes les apps tout de suite. */
  setStatus(status: "auto" | ManualPresence): Promise<boolean>;
}

interface CtxValue {
  subscribe: (l: () => void) => () => void;
  get: () => PresenceState;
  userId: string;
  setStatus: PresenceApi["setStatus"];
}
const Ctx = createContext<CtxValue | null>(null);

/**
 * Les notifications (`NotificationProvider`) voyagent sur le MEME flux que la presence : un seul `EventSource` par onglet vers Compte.
 * Chrome limite a 6 connexions par hote en HTTP/1.1 : un second flux par app ouverte suffisait a bloquer les autres requetes (selecteur d'apps, comptes).
 */
export interface CompteStreamBus {
  /** Recoit chaque evenement SSE nomme « notification » (et le renvoie de zero apres une reconnexion : nouveau « snapshot »). */
  subscribe(listener: (event: unknown) => void): () => void;
}
export const CompteStreamBusContext = createContext<CompteStreamBus | null>(null);

const trim = (u: string) => u.replace(/\/+$/, "");

/**
 * Ouvre UN flux temps reel vers Volcanium Compte (SSE, cookie de session de Compte) et distribue les statuts a tous les
 * composants en dessous : `Sidebar` (rond + menu « Statut »), `Avatar userId=…`, `usePresence()`.
 * A placer au-dessus de la mise en page connectee de chaque app, avec l'identifiant du compte connecte.
 */
export function PresenceProvider({ compteUrl, userId, idleAfterMs = 5 * 60_000, children }: PresenceProviderProps) {
  const store = useRef<{ state: PresenceState; listeners: Set<() => void> }>({ state: INITIAL, listeners: new Set() });
  const connectionId = useRef<string | null>(null);
  const notificationListeners = useRef(new Set<(event: unknown) => void>());
  const bus = useMemo<CompteStreamBus>(() => ({
    subscribe: (l) => { notificationListeners.current.add(l); return () => void notificationListeners.current.delete(l); },
  }), []);
  const base = trim(compteUrl);

  const set = useCallback((next: Partial<PresenceState>) => {
    store.current.state = { ...store.current.state, ...next };
    for (const l of store.current.listeners) l();
  }, []);

  useEffect(() => {
    store.current.state = INITIAL;
    connectionId.current = null;
    if (!userId || typeof EventSource === "undefined") return;
    let source: EventSource | null = null;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    let stopped = false;
    let idle = false;
    let lastInput = Date.now();

    // Transport : WebSocket (pas de plafond de connexions HTTP du navigateur) ; repli SSE si le serveur ne le propose pas (ancien Compte,
    // proxy sans « upgrade ») apres deux echecs d'ouverture.
    let socket: WebSocket | null = null;
    let useSse = typeof WebSocket === "undefined";
    let socketFailures = 0;

    const sendIdle = () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "activity", idle }));
        return;
      }
      if (!connectionId.current) return;
      void fetch(`${base}/user/presence/activity`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId: connectionId.current, idle, expect: userId }),
      }).catch(() => undefined);
    };
    const setIdle = (v: boolean) => {
      if (idle === v) return;
      idle = v;
      sendIdle();
    };
    const onInput = () => {
      lastInput = Date.now();
      if (idle) setIdle(false);
    };
    // Chrome rejoue un « pointermove » quand le contenu bouge sous un curseur immobile (message qui arrive, animation, visio) : sans ce
    // filtre une app ouverte devant un clavier abandonne ne passait jamais « inactif ». Seul un vrai deplacement compte.
    let pointerX = NaN;
    let pointerY = NaN;
    const onPointerMove = (e: PointerEvent) => {
      if (e.screenX === pointerX && e.screenY === pointerY) return;
      pointerX = e.screenX;
      pointerY = e.screenY;
      onInput();
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") onInput();
    };
    const idleTimer = setInterval(() => {
      if (Date.now() - lastInput >= idleAfterMs) setIdle(true);
    }, 15_000);
    const events = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
    for (const e of events) window.addEventListener(e, onInput, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    const handlePresence = (ev: ServerEvent) => {
      const cur = store.current.state;
      if (ev.type === "snapshot") set({ ready: true, self: ev.self, manual: ev.manual, users: ev.users, known: new Set(ev.known ?? []) });
      else if (ev.type === "status") {
        const users = { ...cur.users };
        const known = cur.known.has(ev.userId) ? cur.known : new Set(cur.known).add(ev.userId);
        if (ev.status === "offline") delete users[ev.userId];
        else users[ev.userId] = ev.status;
        set(ev.manual !== undefined ? { users, known, self: ev.status, manual: ev.manual } : { users, known });
      }
    };
    const emitNotification = (ev: unknown) => { for (const l of notificationListeners.current) l(ev); };
    const scheduleRetry = () => {
      set({ ready: false });
      if (stopped) return;
      attempts += 1;
      // Refus (session expiree, autre compte) ou coupure : delai croissant, de 2 s a 60 s.
      retry = setTimeout(open, Math.min(60_000, 1_000 * 2 ** Math.min(attempts, 6)));
    };

    const openSocket = () => {
      const ws = new WebSocket(`${base.replace(/^http/, "ws")}/user/presence/ws?expect=${encodeURIComponent(userId)}`);
      socket = ws;
      let opened = false;
      ws.onopen = () => {
        opened = true;
        attempts = 0;
        socketFailures = 0;
        if (idle) sendIdle(); // un onglet deja inactif au moment de se (re)connecter le dit tout de suite
      };
      ws.onmessage = (m) => {
        let msg: { ch?: string; ev?: unknown };
        try { msg = JSON.parse(String(m.data)) as { ch?: string; ev?: unknown }; } catch { return; }
        if (msg.ch === "presence") handlePresence(msg.ev as ServerEvent);
        else if (msg.ch === "notification") emitNotification(msg.ev);
      };
      ws.onclose = () => {
        if (socket === ws) socket = null;
        if (!opened && ++socketFailures >= 2) useSse = true;
        scheduleRetry();
      };
      ws.onerror = () => ws.close();
    };

    const openSse = () => {
      const es = new EventSource(`${base}/user/presence/stream?expect=${encodeURIComponent(userId)}&notifications=1`, { withCredentials: true });
      source = es;
      es.addEventListener("hello", (e) => {
        try {
          connectionId.current = (JSON.parse((e as MessageEvent).data) as { connectionId: string }).connectionId;
        } catch {
          return;
        }
        attempts = 0;
        if (idle) sendIdle();
      });
      es.addEventListener("notification", (m) => {
        try { emitNotification(JSON.parse((m as MessageEvent).data)); } catch { /* evenement invalide */ }
      });
      es.onmessage = (m) => {
        try { handlePresence(JSON.parse(m.data) as ServerEvent); } catch { /* evenement invalide */ }
      };
      es.onerror = () => {
        es.close();
        if (source === es) source = null;
        connectionId.current = null;
        scheduleRetry();
      };
    };

    const open = () => {
      if (stopped) return;
      if (useSse) openSse();
      else openSocket();
    };
    open();
    return () => {
      stopped = true;
      clearTimeout(retry);
      clearInterval(idleTimer);
      source?.close();
      socket?.close();
      for (const e of events) window.removeEventListener(e, onInput);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
      store.current.state = INITIAL;
    };
  }, [base, userId, idleAfterMs, set]);

  const subscribe = useCallback((l: () => void) => {
    store.current.listeners.add(l);
    return () => void store.current.listeners.delete(l);
  }, []);
  const get = useCallback(() => store.current.state, []);

  const setStatus = useCallback(
    async (status: "auto" | ManualPresence) => {
      if (!userId) return false;
      const before = store.current.state;
      // Instantane pour la personne : l'evenement du serveur confirme (ou corrige) juste apres.
      set({ manual: status === "auto" ? null : status });
      try {
        const res = await fetch(`${base}/user/presence/me`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, expect: userId }),
        });
        if (res.ok) return true;
      } catch {
        /* reseau coupe : on annule ci-dessous */
      }
      set({ manual: before.manual });
      return false;
    },
    [base, userId, set],
  );

  const value = useMemo<CtxValue>(() => ({ subscribe, get, userId: userId ?? "", setStatus }), [subscribe, get, userId, setStatus]);
  return (
    <Ctx.Provider value={value}>
      <CompteStreamBusContext.Provider value={bus}>{children}</CompteStreamBusContext.Provider>
    </Ctx.Provider>
  );
}

const SERVER_SNAPSHOT: PresenceState = INITIAL;

/** Acces au service : `undefined` hors de `PresenceProvider` (les composants restent alors sans rond, rien ne casse). */
export function usePresence(): PresenceApi | undefined {
  const ctx = useContext(Ctx);
  const state = useSyncExternalStore(ctx?.subscribe ?? (() => () => undefined), ctx?.get ?? (() => SERVER_SNAPSHOT), () => SERVER_SNAPSHOT);
  return useMemo(() => {
    if (!ctx) return undefined;
    return {
      self: state.ready ? state.self : undefined,
      manual: state.manual,
      statusOf: (id) => {
        if (!state.ready || !id) return undefined;
        if (id === ctx.userId) return state.self;
        if (state.users[id]) return state.users[id];
        return state.known.has(id) ? "offline" : undefined;
      },
      setStatus: ctx.setStatus,
    };
  }, [ctx, state]);
}

/** Statut d'un utilisateur, ou `undefined` si inconnu / invisible pour moi. */
export function usePresenceOf(userId: string | null | undefined): PresenceStatus | undefined {
  return usePresence()?.statusOf(userId);
}
