import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import NotificationCard from "./NotificationCard";
import { startRingtone } from "./ringtone";

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
  silent: boolean;
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
export function NotificationProvider({ compteUrl, userId, showCards = true, ringtone = true, children }: NotificationProviderProps) {
  const base = trim(compteUrl);
  const [items, setItems] = useState<readonly NotificationItem[]>(EMPTY);
  const election = useRef<ReturnType<typeof createElection> | null>(null);
  const [ringing, setRinging] = useState<ReadonlySet<string>>(new Set()); // appels pour lesquels CET onglet sonne

  useEffect(() => {
    setItems(EMPTY);
    if (!userId || typeof EventSource === "undefined") return undefined;
    let source: EventSource | null = null;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    let stopped = false;
    const timers = new Map<string, ReturnType<typeof setTimeout>>();
    const el = (election.current = createElection());

    const drop = (id: string) => {
      clearTimeout(timers.get(id));
      timers.delete(id);
      el.forget(id);
      setItems((cur) => (cur.some((n) => n.id === id) ? cur.filter((n) => n.id !== id) : cur));
      setRinging((cur) => { if (!cur.has(id)) return cur; const next = new Set(cur); next.delete(id); return next; });
    };
    const add = (item: NotificationItem) => {
      setItems((cur) => [...cur.filter((n) => n.id !== item.id), item]);
      clearTimeout(timers.get(item.id));
      // Filet de securite si l'evenement « dismiss » se perd : la carte ne reste jamais plus longtemps que sa duree de vie.
      timers.set(item.id, setTimeout(() => drop(item.id), Math.max(1_000, item.expiresAt - item.createdAt)));
      if (item.ring && !item.silent) {
        void el.rings(item.id).then((mine) => {
          if (mine && !stopped && timers.has(item.id)) setRinging((cur) => new Set(cur).add(item.id));
        });
      }
    };

    const open = () => {
      if (stopped) return;
      const es = new EventSource(`${base}/user/notifications/stream?expect=${encodeURIComponent(userId)}`, { withCredentials: true });
      source = es;
      es.addEventListener("hello", () => { attempts = 0; });
      es.onmessage = (m) => {
        let ev: ServerEvent;
        try { ev = JSON.parse(m.data) as ServerEvent; } catch { return; }
        if (ev.type === "snapshot") {
          const keep = new Set(ev.items.map((n) => n.id));
          for (const id of [...timers.keys()]) if (!keep.has(id)) drop(id);
          for (const n of ev.items) add(n);
        } else if (ev.type === "notify") add(ev.item);
        else if (ev.type === "dismiss") drop(ev.id);
      };
      es.onerror = () => {
        es.close();
        if (source === es) source = null;
        if (stopped) return;
        attempts += 1;
        retry = setTimeout(open, Math.min(60_000, 2_000 * 2 ** Math.min(attempts, 5)));
      };
    };
    open();
    return () => {
      stopped = true;
      clearTimeout(retry);
      source?.close();
      for (const t of timers.values()) clearTimeout(t);
      el.close();
      election.current = null;
      setRinging(new Set());
      setItems(EMPTY);
    };
  }, [base, userId]);

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

  const run = useCallback((item: NotificationItem, action: NotificationAction) => {
    if (action.href) window.open(action.href, "_blank", "noopener,noreferrer");
    else if (action.request) void fetch(action.request.url, { method: action.request.method, credentials: "omit", mode: "cors" }).catch(() => undefined);
    dismiss(item.id);
  }, [dismiss]);

  const api = useMemo<NotificationsApi>(() => ({ items, dismiss, run }), [items, dismiss, run]);
  return (
    <Ctx.Provider value={api}>
      {children}
      {showCards && items.length > 0 && (
        <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2" aria-live="assertive">
          {items.map((n) => <NotificationCard key={n.id} item={n} onAction={run} onDismiss={(i) => dismiss(i.id)} />)}
        </div>
      )}
    </Ctx.Provider>
  );
}

/** Notifications en cours ; `undefined` hors de `NotificationProvider` (rien ne casse). */
export function useNotifications(): NotificationsApi | undefined {
  return useContext(Ctx) ?? undefined;
}
