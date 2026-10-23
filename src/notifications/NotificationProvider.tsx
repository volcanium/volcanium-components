import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import NotificationCard from "./NotificationCard";
import { CompteStreamBusContext } from "../presence/PresenceProvider";
import { startRingtone } from "./ringtone";
import { chimeTimbreFor, playChime } from "./chime";

/** Action d'une notification : adresse a ouvrir (`href`) ou requete a envoyer (`request`, sans cookie : l'adresse porte son jeton). */
export interface NotificationAction {
  id: string;
  label?: string;
  style?: "primary" | "danger" | "secondary";
  href?: string;
  request?: { url: string; method: "POST" | "PUT" | "DELETE" };
}

/** Notification envoyee par une app via Volcanium Compte (appel entrant aujourd'hui ; message, mail... plus tard). */
export interface NotificationItem {
  id: string;
  source: string;
  kind: string;
  title: string;
  subtitle?: string;
  body?: string;
  /** Texte traduit par la librairie (`notif_body_<bodyKey>`) ; `body` sert de repli. */
  bodyKey?: string;
  image?: string;
  /** Sonnerie en boucle tant que la carte est affichee. */
  ring: boolean;
  /** Pas de son (statut de la personne ou preference) : la carte s'affiche quand meme. */
  silent: boolean;
  /** `high` = mention ou message direct : petit son un peu plus marque. Absent = `normal`. */
  priority?: "normal" | "high";
  actions: NotificationAction[];
  createdAt: number;
  expiresAt: number;
}

type ServerEvent =
  | { type: "snapshot"; items: NotificationItem[] }
  | { type: "notify"; item: NotificationItem }
  | { type: "dismiss"; id: string };

export interface NotificationsApi {
  items: readonly NotificationItem[];
  /** Retire la carte dans tous les onglets / toutes les apps. */
  dismiss(id: string): void;
  /** Execute une action (ouvre l'adresse ou envoie la requete) puis retire la carte. */
  run(item: NotificationItem, action: NotificationAction): void;
}

export interface NotificationProviderProps {
  /** URL de l'API de Volcanium Compte (sans « / » final), ex. `http://localhost:3000`. */
  compteUrl: string;
  /** Identifiant du compte avec lequel l'app est connectee : Compte refuse si le cookie est celui d'un autre compte. */
  userId: string | null | undefined;
  /** Affiche les cartes en haut a droite. Mettre `false` pour les afficher soi-meme avec `useNotifications()` et `NotificationCard`. @default true */
  showCards?: boolean;
  /** Joue la sonnerie des appels entrants. @default true */
  ringtone?: boolean;
  /** Joue les petits sons des autres notifications (message, mail...) : un seul onglet, une fois par rafale. @default true */
  chime?: boolean;
  /** Renvoie `true` pour ne NI afficher NI sonner cette notification dans cette app / cet onglet (ex. la personne regarde deja la conversation). Evaluee a l'arrivee et a l'affichage. */
  suppress?: (item: NotificationItem) => boolean;
  /** Ouvre l'adresse d'une action a la place du nouvel onglet (ex. navigation interne d'une app a page unique) : renvoyer `true` si c'est fait. */
  openHref?: (href: string) => boolean | void;
  children: ReactNode;
}

const Ctx = createContext<NotificationsApi | null>(null);
const trim = (u: string) => u.replace(/\/+$/, "");
const EMPTY: readonly NotificationItem[] = [];

// Plusieurs onglets ouverts : une seule sonnerie. Chaque onglet annonce « je sonne pour tel appel » sur un canal commun ; celui dont
// l'identifiant est le plus petit parmi ceux entendus dans les 300 ms sonne, les autres restent muets (la carte, elle, est partout).
const TAB_ID = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Math.random());
const ELECTION_MS = 300;
function createElection() {
  const claims = new Map<string, Set<string>>();
  let channel: BroadcastChannel | null = null;
  try {
    if (typeof BroadcastChannel !== "undefined") {
      channel = new BroadcastChannel("volcanium-notifications");
      channel.onmessage = (e: MessageEvent<{ id?: string; tab?: string }>) => {
        if (typeof e.data?.id !== "string" || typeof e.data.tab !== "string") return;
        (claims.get(e.data.id) ?? claims.set(e.data.id, new Set()).get(e.data.id)!).add(e.data.tab);
      };
    }
  } catch { channel = null; }
  return {
    /** `true` si cet onglet doit sonner pour `id`. */
    async rings(id: string): Promise<boolean> {
      if (!channel) return true;
      (claims.get(id) ?? claims.set(id, new Set()).get(id)!).add(TAB_ID);
      try { channel.postMessage({ id, tab: TAB_ID }); } catch { return true; }
      await new Promise((r) => setTimeout(r, ELECTION_MS));
      return [...(claims.get(id) ?? [])].every((t) => t >= TAB_ID);
    },
    forget(id: string) { claims.delete(id); },
    close() { channel?.close(); },
  };
}

/**
 * Ouvre UN flux temps reel vers Volcanium Compte (SSE, cookie de session de Compte) et affiche les notifications des autres apps :
 * une carte en haut a droite (photo, texte, boutons), et pour un appel entrant une sonnerie tant qu'on n'a pas repondu.
 * Compte n'envoie rien quand la personne est « en appel » ou « ne pas deranger ». A placer dans `VolcaniumProvider`, a cote de `PresenceProvider`.
 */
export function NotificationProvider({ compteUrl, userId, showCards = true, ringtone = true, chime = true, suppress, openHref, children }: NotificationProviderProps) {
  const base = trim(compteUrl);
  const [items, setItems] = useState<readonly NotificationItem[]>(EMPTY);
  const election = useRef<ReturnType<typeof createElection> | null>(null);
  const bus = useContext(CompteStreamBusContext);
  const suppressRef = useRef(suppress);
  suppressRef.current = suppress;
  const chimeRef = useRef(chime);
  chimeRef.current = chime;
  const isSuppressed = useCallback((n: NotificationItem) => { try { return suppressRef.current?.(n) === true; } catch { return false; } }, []);
  const [leaving, setLeaving] = useState<ReadonlySet<string>>(new Set()); // cartes en train de sortir (animation)
  const [tick, setTick] = useState(0); // re-evalue `suppress` au retour sur l'onglet
  const ctl = useRef<{ pause(id: string): void; resume(id: string): void } | null>(null);
  const [ringing, setRinging] = useState<ReadonlySet<string>>(new Set()); // appels pour lesquels CET onglet sonne

  useEffect(() => {
    setItems(EMPTY);
    if (!userId || typeof EventSource === "undefined") return undefined;
    let source: EventSource | null = null;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    let stopped = false;
    const timers = new Map<string, ReturnType<typeof setTimeout> | undefined>(); // cartes vivantes (valeur undefined = expiration en pause)
    const due = new Map<string, number>(); // echeance (ms epoch) des cartes dont le delai court
    const remaining = new Map<string, number>(); // delai restant des cartes en pause
    const lastChime = new Map<string, number>(); // dernier son par id : un `notify` qui republie le meme id ne re-sonne pas avant 5 s
    let lastAnyChime = 0; // un son par 1,2 s au total
    const el = (election.current = createElection());

    const drop = (id: string) => {
      clearTimeout(timers.get(id));
      timers.delete(id);
      due.delete(id);
      remaining.delete(id);
      lastChime.delete(id);
      el.forget(id);
      setLeaving((cur) => { if (!cur.has(id)) return cur; const next = new Set(cur); next.delete(id); return next; });
      setItems((cur) => (cur.some((n) => n.id === id) ? cur.filter((n) => n.id !== id) : cur));
      setRinging((cur) => { if (!cur.has(id)) return cur; const next = new Set(cur); next.delete(id); return next; });
    };
    // Fin de vie : petite animation de sortie (220 ms) puis la carte est retiree.
    const expire = (id: string) => {
      due.delete(id);
      setLeaving((cur) => new Set(cur).add(id));
      timers.set(id, setTimeout(() => drop(id), 220));
    };
    const schedule = (id: string, ms: number) => {
      clearTimeout(timers.get(id));
      due.set(id, Date.now() + ms);
      timers.set(id, setTimeout(() => expire(id), ms));
    };
    ctl.current = {
      // Survol / focus : le delai est gele (au moins 2 s restantes a la reprise).
      pause(id) {
        if (!timers.has(id) || remaining.has(id) || !due.has(id)) return;
        clearTimeout(timers.get(id));
        timers.set(id, undefined);
        remaining.set(id, Math.max(2_000, (due.get(id) ?? 0) - Date.now()));
      },
      resume(id) {
        const ms = remaining.get(id);
        if (ms === undefined || !timers.has(id)) return;
        remaining.delete(id);
        schedule(id, ms);
      },
    };
    const chimeFor = (item: NotificationItem) => {
      const now = Date.now();
      const prev = lastChime.get(item.id);
      if (prev !== undefined && now - prev < 5_000) return; // la conversation continue : la carte est mise a jour, pas de re-ding
      lastChime.set(item.id, now);
      const key = `chime:${item.id}:${item.createdAt}`;
      void el.rings(key).then((mine) => {
        window.setTimeout(() => el.forget(key), 1_000);
        if (!mine || stopped || !chimeRef.current || !timers.has(item.id)) return;
        const t = Date.now();
        if (t - lastAnyChime < 1_200) return;
        if (playChime(chimeTimbreFor(item.kind), item.priority ?? "normal")) lastAnyChime = t;
      });
    };
    const add = (item: NotificationItem, fresh = true) => {
      if (isSuppressed(item)) { drop(item.id); return; }
      const known = timers.has(item.id);
      setItems((cur) => [...cur.filter((n) => n.id !== item.id), item]);
      setLeaving((cur) => { if (!cur.has(item.id)) return cur; const next = new Set(cur); next.delete(item.id); return next; });
      // Filet de securite si l'evenement « dismiss » se perd : la carte ne reste jamais plus longtemps que sa duree de vie.
      const ttl = Math.max(1_000, item.expiresAt - item.createdAt);
      if (remaining.has(item.id)) { clearTimeout(timers.get(item.id)); remaining.set(item.id, ttl); timers.set(item.id, undefined); }
      else if (!(known && !fresh)) schedule(item.id, ttl); // un snapshot de reconnexion ne prolonge pas une carte deja la
      if (fresh && !item.ring && !item.silent) chimeFor(item);
      if (item.ring && !item.silent) {
        void el.rings(item.id).then((mine) => {
          if (mine && !stopped && timers.has(item.id)) setRinging((cur) => new Set(cur).add(item.id));
        });
      }
    };

    const handle = (ev: ServerEvent) => {
      if (ev.type === "snapshot") {
        const keep = new Set(ev.items.map((n) => n.id));
        for (const id of [...timers.keys()]) if (!keep.has(id)) drop(id);
        for (const n of ev.items) add(n, false);
      } else if (ev.type === "notify") add(ev.item);
      else if (ev.type === "dismiss") drop(ev.id);
    };

    // Dans un `PresenceProvider` : on ecoute SON flux (un seul EventSource par onglet). Sans lui : flux a part.
    let unsubscribe: (() => void) | undefined;
    const open = () => {
      if (stopped) return;
      const es = new EventSource(`${base}/user/notifications/stream?expect=${encodeURIComponent(userId)}`, { withCredentials: true });
      source = es;
      es.addEventListener("hello", () => { attempts = 0; });
      es.onmessage = (m) => {
        let ev: ServerEvent;
        try { ev = JSON.parse(m.data) as ServerEvent; } catch { return; }
        handle(ev);
      };
      es.onerror = () => {
        es.close();
        if (source === es) source = null;
        if (stopped) return;
        attempts += 1;
        retry = setTimeout(open, Math.min(60_000, 2_000 * 2 ** Math.min(attempts, 5)));
      };
    };
    if (bus) unsubscribe = bus.subscribe((ev) => handle(ev as ServerEvent));
    else open();
    return () => {
      stopped = true;
      unsubscribe?.();
      clearTimeout(retry);
      source?.close();
      for (const t of timers.values()) clearTimeout(t);
      el.close();
      election.current = null;
      setRinging(new Set());
      setItems(EMPTY);
    };
  }, [base, userId, bus, isSuppressed]);

  // Retour sur l'onglet : `suppress` peut avoir change (la personne a quitte la conversation, ou y est arrivee).
  useEffect(() => {
    const bump = () => { if (document.visibilityState !== "hidden") setTick((n) => n + 1); };
    window.addEventListener("focus", bump);
    document.addEventListener("visibilitychange", bump);
    return () => { window.removeEventListener("focus", bump); document.removeEventListener("visibilitychange", bump); };
  }, []);

  const ringNow = ringtone && ringing.size > 0;
  useEffect(() => (ringNow ? startRingtone() : undefined), [ringNow]);

  const dismiss = useCallback((id: string) => {
    setItems((cur) => cur.filter((n) => n.id !== id));
    setRinging((cur) => { if (!cur.has(id)) return cur; const next = new Set(cur); next.delete(id); return next; });
    if (!userId) return;
    // Les autres onglets / apps l'apprennent par le flux ; si l'envoi echoue, la carte expire de toute facon.
    void fetch(`${base}/user/notifications/${encodeURIComponent(id)}/dismiss`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expect: userId }),
    }).catch(() => undefined);
  }, [base, userId]);

  const openRef = useRef(openHref);
  openRef.current = openHref;
  const run = useCallback((item: NotificationItem, action: NotificationAction) => {
    if (action.href) { if (!openRef.current?.(action.href)) window.open(action.href, "_blank", "noopener,noreferrer"); }
    else if (action.request) void fetch(action.request.url, { method: action.request.method, credentials: "omit", mode: "cors" }).catch(() => undefined);
    dismiss(item.id);
  }, [dismiss]);

  // Affichage : on re-evalue `suppress` (la personne peut etre arrivee dans la conversation depuis l'arrivee de la carte).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const visible = useMemo(() => (suppress ? items.filter((n) => !isSuppressed(n)) : items), [items, tick, !!suppress, isSuppressed]);
  const api = useMemo<NotificationsApi>(() => ({ items: visible, dismiss, run }), [visible, dismiss, run]);
  return (
    <Ctx.Provider value={api}>
      {children}
      {showCards && visible.length > 0 && (
        <div className="pointer-events-none fixed right-4 top-4 max-sm:top-[max(1rem,env(safe-area-inset-top))] z-[100] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2" aria-live="assertive">
          {visible.map((n) => (
            <NotificationCard
              key={n.id}
              item={n}
              leaving={leaving.has(n.id)}
              onAction={run}
              onDismiss={(i) => dismiss(i.id)}
              onHoldChange={(i, held) => (held ? ctl.current?.pause(i.id) : ctl.current?.resume(i.id))}
            />
          ))}
        </div>
      )}
    </Ctx.Provider>
  );
}

/** Notifications en cours ; `undefined` hors de `NotificationProvider` (rien ne casse). */
export function useNotifications(): NotificationsApi | undefined {
  return useContext(Ctx) ?? undefined;
}
