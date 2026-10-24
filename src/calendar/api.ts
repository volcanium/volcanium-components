import type { BirthdayContact, CalEvent, CalendarInfo, EventInput, Status, ApiResult } from "./types";

const seg = (v: string) => encodeURIComponent(v);
const json = (method: string, body: unknown): RequestInit => ({ method, body: JSON.stringify(body) });

/** Appel HTTP de l'application hote : chemin relatif a son API, jamais d'exception (voir `ApiResult`). */
export type CalendarCall = <T>(path: string, init?: RequestInit) => Promise<ApiResult<T>>;

/**
 * Client du calendrier. `prefix` = debut des routes dans l'API de l'hote (`/mail/calendar` dans Mail, `/calendar` dans Communication) ;
 * les deux applications parlent au meme calendrier (celui de Volcanium Mail, qui vit dans Stalwart).
 */
export function createCalendarApi(call: CalendarCall, prefix: string) {
  const p = prefix;
  return {
  calendars: () => call<{ calendars: CalendarInfo[] }>(`${p}/calendars`),
  createCalendar: (name: string, color: string) => call<{ calendar: CalendarInfo }>(`${p}/calendars`, json("POST", { name, color })),
  updateCalendar: (id: string, patch: { name?: string; color?: string; isVisible?: boolean }) => call<{ calendar: CalendarInfo }>(`${p}/calendars/${seg(id)}`, json("PATCH", patch)),
  deleteCalendar: (id: string) => call<{ ok: true }>(`${p}/calendars/${seg(id)}`, { method: "DELETE" }),
  /** Agendas des comptes externes (iCloud, Yahoo) : lus chez le fournisseur, charges a part ; `failed` = comptes dont l'agenda n'a pas pu etre lu. */
  externalCalendars: () => call<{ calendars: CalendarInfo[]; failed: string[] }>(`${p}/external/calendars`),
  externalEvents: (fromIso: string, toIso: string) => call<{ events: CalEvent[]; failed: string[] }>(`${p}/external/events?from=${seg(fromIso)}&to=${seg(toIso)}`),
  birthdays: () => call<{ birthdays: BirthdayContact[] }>(`${p}/birthdays`),
  events: (fromIso: string, toIso: string) => call<{ events: CalEvent[] }>(`${p}/events?from=${seg(fromIso)}&to=${seg(toIso)}`),
  /** Evenement MAITRE d'une serie (date de depart et regle de repetition), a partir d'une occurrence. */
  series: (id: string) => call<{ event: CalEvent }>(`${p}/events/${seg(id)}/series`),
  /** Evenement a jour : pour l'organisateur, les reponses des invites recues par courrier sont appliquees a l'ouverture. */
  event: (id: string) => call<{ event: CalEvent }>(`${p}/events/${seg(id)}`),
  createEvent: (input: EventInput, videoMeeting?: { lobby: boolean; allowGuests: boolean } | null) => call<{ event: CalEvent; unsent: string[] }>(`${p}/events`, json("POST", videoMeeting ? { ...input, videoMeeting } : input)),
  updateEvent: (id: string, patch: Partial<EventInput>) => call<{ event: CalEvent; unsent: string[] }>(`${p}/events/${seg(id)}`, json("PATCH", patch)),
  deleteEvent: (id: string) => call<{ ok: true; unsent: string[] }>(`${p}/events/${seg(id)}`, { method: "DELETE" }),
  respond: (id: string, status: Exclude<Status, "needs-action">) => call<{ event: CalEvent; replied: boolean }>(`${p}/events/${seg(id)}/respond`, json("POST", { status })),
  };
}

export type CalendarApi = ReturnType<typeof createCalendarApi>;
