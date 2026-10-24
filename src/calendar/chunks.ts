import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ApiResult, CalEvent } from "./types";
import { addDays, queryRange } from "./time";

/**
 * Chargement des evenements par TRANCHES FIXES de 35 jours (alignees sur le calendrier, pas sur ce qui est affiche) :
 *  - une tranche deja chargee n'est jamais redemandee tant qu'elle est recente (naviguer d'un mois a l'autre, revenir en arriere, passer de
 *    semaine a mois : zero requete) ; apres `FRESH_MS` elle est redemandee EN ARRIERE-PLAN, l'ecran garde l'ancienne version entre-temps ;
 *  - la vue defilante qui s'etend ne demande que les tranches NOUVELLES (avant : tout etait redemande a chaque extension) ;
 *  - deux composants qui demandent la meme tranche en meme temps ne font qu'une requete ;
 *  - une modification invalide tout (`epoch`) : les tranches visibles sont redemandees, sans ecran vide.
 */
const SPAN = 35;
const FRESH_MS = 60_000;
const DAY = 86_400_000;

const dayIndex = (d: Date): number => Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY);
const fromIndex = (i: number): Date => { const u = new Date(i * DAY); return new Date(u.getUTCFullYear(), u.getUTCMonth(), u.getUTCDate()); };

/** Tranches (indices) qui couvrent ces jours. */
export function chunkIndexes(days: Date[]): number[] {
  if (days.length === 0) return [];
  const first = Math.floor(dayIndex(days[0]!) / SPAN), last = Math.floor(dayIndex(days[days.length - 1]!) / SPAN);
  return Array.from({ length: last - first + 1 }, (_, i) => first + i);
}

/** Jours d'une tranche, pour fabriquer la requete (`queryRange` y ajoute la marge des fuseaux). */
export const chunkDaysOf = (index: number): Date[] => Array.from({ length: SPAN }, (_, i) => addDays(fromIndex(index * SPAN), i));

interface Entry { events: CalEvent[]; failed: string[]; at: number; epoch: number }
export type RangeLoader = (from: string, to: string) => Promise<ApiResult<{ events: CalEvent[]; failed?: string[] }>>;

export interface ChunkedEvents {
  events: CalEvent[];
  /** Comptes dont l'agenda n'a pas pu etre lu (agendas externes). */
  failed: string[];
  /** Au moins une tranche demandee a echoue. */
  error: boolean;
  /** Modifie les evenements deja charges tout de suite (affichage optimiste) ; renvoie la fonction qui annule. */
  patch(fn: (e: CalEvent) => CalEvent): () => void;
}

export function useChunkedEvents(days: Date[], load: RangeLoader, enabled: boolean, epoch: number): ChunkedEvents {
  const store = useRef(new Map<number, Entry>());
  const inflight = useRef(new Map<string, Promise<void>>());
  const [tick, setTick] = useState(0);
  const [error, setError] = useState(false);
  const loadRef = useRef(load);
  loadRef.current = load;
  const needed = useMemo(() => chunkIndexes(days), [days]);
  const key = needed.join(",");

  useEffect(() => {
    if (!enabled) return;
    let live = true;
    const now = Date.now();
    for (const idx of needed) {
      const have = store.current.get(idx);
      if (have && have.epoch === epoch && now - have.at < FRESH_MS) continue;
      const flight = `${epoch}:${idx}`;
      if (inflight.current.has(flight)) continue;
      const { from, to } = queryRange(chunkDaysOf(idx));
      const p = loadRef.current(from, to).then((r) => {
        inflight.current.delete(flight);
        if (r.error || !r.data) { if (live) setError(true); return; }
        // Une reponse d'une epoque depassee ne remplace pas une plus recente (la modification a eu lieu entre-temps).
        const cur = store.current.get(idx);
        if (cur && cur.epoch > epoch) return;
        store.current.set(idx, { events: r.data.events, failed: r.data.failed ?? [], at: Date.now(), epoch });
        if (live) { setError(false); setTick((n) => n + 1); }
      });
      inflight.current.set(flight, p);
    }
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `key` resume `needed`
  }, [enabled, key, epoch]);

  const merged = useMemo(() => {
    const byId = new Map<string, CalEvent>();
    const failed = new Set<string>();
    if (enabled) for (const idx of needed) {
      const e = store.current.get(idx);
      if (!e) continue;
      for (const ev of e.events) byId.set(ev.id, ev);
      for (const f of e.failed) failed.add(f);
    }
    return { events: [...byId.values()], failed: [...failed] };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `tick` signale un changement du magasin
  }, [enabled, key, tick]);

  const patch = useCallback((fn: (e: CalEvent) => CalEvent) => {
    const before = new Map(store.current);
    for (const [idx, e] of store.current) store.current.set(idx, { ...e, events: e.events.map(fn) });
    setTick((n) => n + 1);
    return () => { store.current = before; setTick((n) => n + 1); };
  }, []);

  return { ...merged, error, patch };
}
