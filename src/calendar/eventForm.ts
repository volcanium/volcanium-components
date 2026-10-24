import type { CalEvent, EventInput, RecurrenceInput } from "./types";
import { addDays, browserTimeZone, dayKey, epochToZoned, fromDayKey, parseDuration, zonedToEpoch } from "./time";

// Etat du formulaire d'evenement et conversion vers/depuis l'API. Pure et testee : les fuseaux et la duree se calculent ici.

export interface Guest { email: string; name: string }
export interface FormState {
  title: string; calendarId: string; allDay: boolean;
  startDate: string; startTime: string; endDate: string; endTime: string; timeZone: string;
  location: string; description: string;
  repeat: "none" | "daily" | "weekly" | "monthly" | "yearly"; interval: number; endKind: "never" | "count" | "date"; count: number; until: string;
  guests: Guest[];
}

const pad = (n: number) => String(n).padStart(2, "0");
const hm = (epoch: number, tz: string) => epochToZoned(epoch, tz).slice(11, 16);
const ymd = (epoch: number, tz: string) => epochToZoned(epoch, tz).slice(0, 10);

/** Nouvel evenement : le jour choisi, a l'heure pleine suivante (ou a 09:00 pour un jour futur), une heure, fuseau du navigateur. */
export function newForm(day: Date, calendarId: string, now = new Date(), tz = browserTimeZone()): FormState {
  const isToday = dayKey(day) === dayKey(now);
  const startH = isToday ? Math.min(now.getHours() + 1, 22) : 9;
  const start = `${dayKey(day)}T${pad(startH)}:00`;
  const end = epochToZoned(zonedToEpoch(`${start}:00`, null) + 3_600_000, null);
  return { title: "", calendarId, allDay: false, startDate: dayKey(day), startTime: start.slice(11), endDate: end.slice(0, 10), endTime: end.slice(11, 16), timeZone: tz,
    location: "", description: "", repeat: "none", interval: 1, endKind: "never", count: 10, until: dayKey(addDays(day, 30)), guests: [] };
}

/** Formulaire d'un evenement existant (ou de sa serie) : heures exprimees dans le fuseau PROPRE de l'evenement. */
export function formFrom(e: CalEvent, tz = browserTimeZone()): FormState {
  const minutes = parseDuration(e.duration);
  const zone = e.timeZone ?? tz;
  const guests = e.participants.filter((p) => !p.isMe && !(p.isOrganizer && e.isOrganizer)).map((p) => ({ email: p.email, name: p.name }));
  const rec = e.recurrence;
  const base = { title: e.title, calendarId: e.calendarId ?? "", location: e.location, description: e.description, guests,
    repeat: (rec?.frequency ?? "none") as FormState["repeat"], interval: rec?.interval ?? 1, endKind: (rec ? (rec.count !== null ? "count" : rec.until ? "date" : "never") : "never") as FormState["endKind"],
    count: rec?.count ?? 10, until: rec?.until?.slice(0, 10) ?? dayKey(addDays(fromDayKey(e.start.slice(0, 10)), 30)) };
  if (e.allDay) {
    const days = Math.max(1, Math.round(minutes / 1440));
    const last = dayKey(addDays(fromDayKey(e.start.slice(0, 10)), days - 1));
    return { ...base, allDay: true, startDate: e.start.slice(0, 10), startTime: "09:00", endDate: last, endTime: "10:00", timeZone: tz };
  }
  const startMs = zonedToEpoch(e.start, zone);
  const endMs = startMs + minutes * 60_000;
  return { ...base, allDay: false, startDate: ymd(startMs, zone), startTime: hm(startMs, zone), endDate: ymd(endMs, zone), endTime: hm(endMs, zone), timeZone: zone };
}

export type FormError = "title" | "time" | null;

export function validate(f: FormState): FormError {
  if (!f.title.trim()) return "title";
  if (f.allDay) return f.endDate < f.startDate ? "time" : null;
  const s = zonedToEpoch(`${f.startDate}T${f.startTime}:00`, f.timeZone);
  const e = zonedToEpoch(`${f.endDate}T${f.endTime}:00`, f.timeZone);
  return Number.isNaN(s) || Number.isNaN(e) || e <= s ? "time" : null;
}

export function recurrenceOf(f: FormState): RecurrenceInput | null {
  if (f.repeat === "none") return null;
  return { frequency: f.repeat, ...(f.interval > 1 ? { interval: f.interval } : {}), ...(f.endKind === "count" ? { count: f.count } : {}), ...(f.endKind === "date" ? { until: f.until } : {}) };
}

/** Corps envoye a l'API (creation et modification : tous les champs, la serie est remplacee d'un bloc). */
export function toInput(f: FormState): EventInput {
  const days = Math.max(1, Math.round((fromDayKey(f.endDate).getTime() - fromDayKey(f.startDate).getTime()) / 86_400_000) + 1);
  const minutes = Math.max(1, Math.round((zonedToEpoch(`${f.endDate}T${f.endTime}:00`, f.timeZone) - zonedToEpoch(`${f.startDate}T${f.startTime}:00`, f.timeZone)) / 60_000));
  return {
    calendarId: f.calendarId, title: f.title.trim(), description: f.description, location: f.location.trim(), allDay: f.allDay,
    start: f.allDay ? `${f.startDate}T00:00` : `${f.startDate}T${f.startTime}`, timeZone: f.timeZone,
    durationMinutes: f.allDay ? 60 : minutes, days: f.allDay ? days : 1, recurrence: recurrenceOf(f),
    participants: f.guests.map((g) => ({ email: g.email, ...(g.name ? { name: g.name } : {}) })),
  };
}

const EMAIL = /^[^\s@<>()[\],;:"\\]{1,64}@[A-Za-z0-9.-]{1,253}\.[A-Za-z]{2,}$/;
export const isEmail = (v: string) => EMAIL.test(v.trim());

/**
 * Invites au moment d'enregistrer : l'adresse tapee dans le champ mais pas validee par « Ajouter » en fait partie (sinon l'invitation ne part
 * jamais). `null` = adresse saisie invalide (a corriger). Doublons ignores, adresse mise en minuscules, nom repris de l'annuaire si connu.
 */
export function withPendingGuest(guests: Guest[], typed: string, nameOf: (email: string) => string = () => ""): Guest[] | null {
  const email = typed.trim().toLowerCase();
  if (!email) return guests;
  if (!isEmail(email)) return null;
  return guests.some((g) => g.email === email) ? guests : [...guests, { email, name: nameOf(email) }];
}
