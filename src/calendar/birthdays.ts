import type { Birthday, BirthdayContact, CalEvent, CalendarInfo } from "./types";

// Anniversaires des contacts, affiches dans le calendrier. Ils ne sont PAS stockes comme des evenements : le calendrier « Anniversaires » est calcule
// ici a partir des contacts (une seule source de verite, rien a synchroniser quand un contact change ou disparait).

/** Identifiant du calendrier « Anniversaires » (propre au panel : Stalwart ne le connait pas). */
export const BIRTHDAY_CALENDAR_ID = "birthdays";
export const BIRTHDAY_COLOR = "#ec4899";
const PREFIX = "bday:";

export const isBirthdayEvent = (e: Pick<CalEvent, "id">): boolean => e.id.startsWith(PREFIX);
/** Contact derriere un evenement d'anniversaire. */
export const birthdayContactId = (e: Pick<CalEvent, "id">): string => e.id.slice(PREFIX.length).split(":")[0] ?? "";

export const birthdayCalendar = (name: string, isVisible: boolean, color: string = BIRTHDAY_COLOR): CalendarInfo => ({ id: BIRTHDAY_CALENDAR_ID, name, color, isDefault: false, isVisible, sortOrder: Number.MAX_SAFE_INTEGER });

const pad = (n: number): string => String(n).padStart(2, "0");
const isLeap = (y: number): boolean => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

/** Les anniversaires de ces annees : un evenement « journee entiere » par contact et par an. Le 29 fevrier tombe le 28 les annees non bissextiles. */
export function birthdayEvents(contacts: Pick<BirthdayContact, "id" | "name" | "birthday">[], years: number[], title: (name: string, age: number | null) => string): CalEvent[] {
  const out: CalEvent[] = [];
  for (const c of contacts) {
    const b = c.birthday;
    for (const y of years) {
      const day = b.month === 2 && b.day === 29 && !isLeap(y) ? 28 : b.day;
      const age = b.year !== null && y > b.year ? y - b.year : null;
      const id = `${PREFIX}${c.id}:${y}`;
      out.push({
        id, uid: id, calendarId: BIRTHDAY_CALENDAR_ID, title: title(c.name, age), description: "", location: "",
        start: `${y}-${pad(b.month)}-${pad(day)}T00:00:00`, timeZone: null, duration: "P1D", allDay: true,
        recurrence: null, recurrenceId: null, participants: [], organizerEmail: null, myStatus: null, isOrganizer: false, status: "confirmed",
      });
    }
  }
  return out;
}

/** Champs du formulaire -> anniversaire : `null` = rien de saisi, `"invalid"` = saisie incomplete ou impossible (jour/mois obligatoires, annee facultative). */
export function birthdayFromFields(f: { day: string; month: string; year: string }): Birthday | null | "invalid" {
  const day = f.day.trim(), month = f.month.trim(), year = f.year.trim();
  if (!day && !month && !year) return null;
  if (!/^\d{1,2}$/.test(day) || !/^\d{1,2}$/.test(month) || (year !== "" && !/^\d{4}$/.test(year))) return "invalid";
  const d = Number(day), m = Number(month), y = year === "" ? null : Number(year);
  if (m < 1 || m > 12 || d < 1 || y !== null && (y < 1900 || y > 2100)) return "invalid";
  const max = new Date(Date.UTC(y ?? 2000, m, 0)).getUTCDate(); // sans annee : annee bissextile, le 29 fevrier reste possible
  return d > max ? "invalid" : { month: m, day: d, year: y };
}

/** Anniversaire a afficher (« 17 mai 1985 », ou « 17 mai » sans annee). */
export function formatBirthday(b: Birthday, locale: string): string {
  const d = new Date(Date.UTC(b.year ?? 2000, b.month - 1, b.day));
  return new Intl.DateTimeFormat(locale, b.year === null ? { day: "numeric", month: "long", timeZone: "UTC" } : { dateStyle: "long", timeZone: "UTC" }).format(d);
}
