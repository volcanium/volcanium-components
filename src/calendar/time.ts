// Calculs du calendrier cote panel : fuseaux horaires, grilles du mois et de la semaine, positionnement. Fonctions pures, testees.
// L'API transmet l'heure LOCALE d'un evenement et son fuseau ; on la convertit ici vers le fuseau du navigateur pour l'affichage.

import type { CalEvent } from "./types";

const MIN = 60_000;
const DAY = 86_400_000;

/** `PT1H30M`, `P2D`, `PT45M` -> minutes (0 si illisible). */
export function parseDuration(iso: string): number {
  const m = iso.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/);
  if (!m) return 0;
  return Number(m[1] ?? 0) * 1440 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0) + Math.floor(Number(m[4] ?? 0) / 60);
}

const pad = (n: number, w = 2) => String(n).padStart(w, "0");
export const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromDayKey = (k: string) => new Date(Number(k.slice(0, 4)), Number(k.slice(5, 7)) - 1, Number(k.slice(8, 10)));
export const addDays = (d: Date, n: number) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); return x; };
export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Decalage (ms) d'un fuseau a un instant donne : heure locale du fuseau - heure UTC. */
function offsetAt(epoch: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric" }).formatToParts(new Date(epoch));
  const v = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  return Date.UTC(v("year"), v("month") - 1, v("day"), v("hour"), v("minute"), v("second")) - Math.floor(epoch / 1000) * 1000;
}

/** Instant (ms depuis 1970) d'une heure locale `YYYY-MM-DDTHH:mm[:ss]` dans un fuseau. `null` = fuseau du navigateur. */
export function zonedToEpoch(local: string, timeZone: string | null): number {
  const m = local.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return NaN;
  const [y, mo, d, h, mi, s] = [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4]), Number(m[5]), Number(m[6] ?? 0)];
  if (!timeZone) return new Date(y, mo - 1, d, h, mi, s).getTime();
  const guess = Date.UTC(y, mo - 1, d, h, mi, s);
  let epoch = guess - offsetAt(guess, timeZone);
  epoch = guess - offsetAt(epoch, timeZone); // 2e passe : autour d'un changement d'heure
  return epoch;
}

/** Heure locale `YYYY-MM-DDTHH:mm:ss` d'un instant dans un fuseau (`null` = navigateur). */
export function epochToZoned(epoch: number, timeZone: string | null): string {
  if (!timeZone) { const d = new Date(epoch); return `${dayKey(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; }
  const o = new Date(epoch + offsetAt(epoch, timeZone));
  return `${o.getUTCFullYear()}-${pad(o.getUTCMonth() + 1)}-${pad(o.getUTCDate())}T${pad(o.getUTCHours())}:${pad(o.getUTCMinutes())}:${pad(o.getUTCSeconds())}`;
}

export const browserTimeZone = (): string => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

export interface Span { start: Date; end: Date; allDay: boolean }
/**
 * Debut et fin d'un evenement dans le fuseau du navigateur. Journee entiere : dates « flottantes » (le 20 mars est le 20 mars partout),
 * fin EXCLUE a minuit. Evenement horaire : instant reel converti.
 */
export function eventSpan(e: Pick<CalEvent, "start" | "timeZone" | "duration" | "allDay">): Span {
  const minutes = Math.max(parseDuration(e.duration), 0);
  if (e.allDay) {
    const start = fromDayKey(e.start.slice(0, 10));
    return { start, end: addDays(start, Math.max(1, Math.round(minutes / 1440))), allDay: true };
  }
  const startMs = zonedToEpoch(e.start, e.timeZone);
  return { start: new Date(startMs), end: new Date(startMs + Math.max(minutes, 0) * MIN), allDay: false };
}

/** 6 semaines x 7 jours couvrant le mois de `ref`, la semaine commence le lundi. */
export function monthGrid(ref: Date): Date[] {
  const first = new Date(ref.getFullYear(), ref.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, i) => addDays(first, i - offset));
}
export function weekDays(ref: Date): Date[] {
  const monday = addDays(startOfDay(ref), -((ref.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

/** Evenements par jour (cle `YYYY-MM-DD`) : un evenement sur plusieurs jours figure dans chacun, tries (journee entiere d'abord, puis heure). */
export function eventsByDay(events: CalEvent[], days: Date[]): Map<string, { event: CalEvent; span: Span }[]> {
  const out = new Map<string, { event: CalEvent; span: Span }[]>(days.map((d) => [dayKey(d), []]));
  for (const event of events) {
    const span = eventSpan(event);
    if (Number.isNaN(span.start.getTime())) continue;
    const last = new Date(Math.max(span.end.getTime() - 1, span.start.getTime()));
    for (let d = startOfDay(span.start); d.getTime() <= last.getTime(); d = addDays(d, 1)) out.get(dayKey(d))?.push({ event, span });
  }
  for (const list of out.values()) list.sort((a, b) => Number(b.span.allDay) - Number(a.span.allDay) || a.span.start.getTime() - b.span.start.getTime() || a.event.title.localeCompare(b.event.title));
  return out;
}

export interface Placed { event: CalEvent; top: number; height: number; column: number; columns: number; span: number }
/** Positionnement d'une colonne de jour (vue semaine) : minutes depuis minuit, chevauchements repartis en colonnes. */
export function layoutDay(items: { event: CalEvent; span: Span }[], day: Date): Placed[] {
  const dayStart = startOfDay(day).getTime();
  const rows = items.filter((i) => !i.span.allDay).map((i) => {
    const top = Math.max(0, (i.span.start.getTime() - dayStart) / MIN);
    const end = Math.min(1440, (i.span.end.getTime() - dayStart) / MIN);
    return { event: i.event, top, end: Math.max(end, top + 20) };
  }).sort((a, b) => a.top - b.top || b.end - a.end);
  const placed: Placed[] = [];
  let cluster: { event: CalEvent; top: number; end: number; column: number }[] = [];
  let clusterEnd = -1;
  // Une pastille s'etend sur les colonnes voisines restees libres pendant sa duree (pleine largeur quand rien ne la chevauche).
  const flush = () => {
    const cols = Math.max(1, ...cluster.map((c) => c.column + 1));
    for (const c of cluster) {
      let span = 1;
      while (c.column + span < cols && !cluster.some((o) => o.column === c.column + span && o.top < c.end && o.end > c.top)) span++;
      placed.push({ event: c.event, top: c.top, height: Math.min(c.end, 1440) - c.top, column: c.column, columns: cols, span });
    }
    cluster = [];
  };
  for (const r of rows) {
    if (r.top >= clusterEnd) { flush(); clusterEnd = -1; }
    const used = new Set(cluster.filter((c) => c.end > r.top).map((c) => c.column));
    let column = 0;
    while (used.has(column)) column++;
    cluster.push({ ...r, column });
    clusterEnd = Math.max(clusterEnd, r.end);
  }
  flush();
  return placed;
}

/** Plage a interroger pour une vue : de `from` (inclus) a `to` (exclu), en UTC, avec une marge d'un jour pour les fuseaux. */
export function queryRange(days: Date[]): { from: string; to: string } {
  return { from: new Date(addDays(days[0]!, -1).getTime()).toISOString(), to: new Date(addDays(days[days.length - 1]!, 2).getTime()).toISOString() };
}

export const DAY_MS = DAY;

// ---- deplacement a la souris, annee, mini-calendrier ----------------------------------------------------------------------

/** Arrondit un nombre de minutes au pas voulu (15 par defaut), borne a la journee. */
export const snapMinutes = (m: number, step = 15): number => Math.min(1440 - step, Math.max(0, Math.round(m / step) * step));

/** L'evenement peut-il etre deplace a la souris ? Seul l'organisateur, hors serie (une serie se modifie en entier par la fenetre) et hors evenement annule. */
export const isMovable = (e: Pick<CalEvent, "isOrganizer" | "recurrence" | "recurrenceId" | "status">): boolean =>
  e.isOrganizer && e.recurrence === null && e.recurrenceId === null && e.status !== "cancelled";

/**
 * Nouveau `start` (heure locale du FUSEAU DE L'EVENEMENT, `YYYY-MM-DDTHH:mm`) quand l'evenement est depose a `target` (instant du navigateur).
 * Journee entiere : seul le jour compte. `timeZone` = fuseau a envoyer a l'API (celui de l'evenement, sinon celui du navigateur).
 */
export function movedStart(e: Pick<CalEvent, "allDay" | "timeZone">, target: Date, browserTz: string): { start: string; timeZone: string } {
  if (e.allDay) return { start: `${dayKey(target)}T00:00`, timeZone: e.timeZone ?? browserTz };
  const zone = e.timeZone ?? browserTz;
  return { start: epochToZoned(target.getTime(), zone).slice(0, 16), timeZone: zone };
}

/** Meme heure du jour (fuseau du navigateur) sur un autre jour : depot d'un evenement sur une case du mois. */
export function sameTimeOnDay(span: Span, day: Date): Date {
  return span.allDay ? startOfDay(day) : new Date(day.getFullYear(), day.getMonth(), day.getDate(), span.start.getHours(), span.start.getMinutes());
}

/** Debut d'un jour + un nombre de minutes : depot sur la grille horaire de la semaine. */
export const atMinutes = (day: Date, minutes: number): Date => new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, minutes);

/** Les 12 mois d'une annee, chacun avec ses 6 semaines (grille du lundi) pour la vue annee et le mini-calendrier. */
export const yearMonths = (year: number): Date[] => Array.from({ length: 12 }, (_, m) => new Date(year, m, 1));

/** Tous les jours d'une annee civile (pour interroger ses evenements). */
export function yearDays(year: number): Date[] {
  const out: Date[] = [];
  for (let d = new Date(year, 0, 1); d.getFullYear() === year; d = addDays(d, 1)) out.push(d);
  return out;
}

/** Decoupe une liste de jours en morceaux de `size` jours au plus (l'API limite une requete a 100 jours). */
export function chunkDays(days: Date[], size = 80): Date[][] {
  const out: Date[][] = [];
  for (let i = 0; i < days.length; i += size) out.push(days.slice(i, i + size));
  return out;
}

/** Jours qui portent au moins un evenement (vue annee, mini-calendrier). */
export function busyDays(events: CalEvent[]): Set<string> {
  const out = new Set<string>();
  for (const e of events) {
    const span = eventSpan(e);
    if (Number.isNaN(span.start.getTime())) continue;
    const last = new Date(Math.max(span.end.getTime() - 1, span.start.getTime()));
    for (let d = startOfDay(span.start); d.getTime() <= last.getTime(); d = addDays(d, 1)) out.add(dayKey(d));
  }
  return out;
}

/** Heure actuelle en minutes depuis minuit (ligne « maintenant » de la vue semaine). */
export const minutesNow = (now = new Date()): number => now.getHours() * 60 + now.getMinutes();
