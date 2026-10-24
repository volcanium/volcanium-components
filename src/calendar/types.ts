// Types de l'API du calendrier (miroir de apps/api/src/lib/calendar.ts de Volcanium Mail). Tout ce qui arrive ici est deja projete cote serveur
// (champs connus, tailles bornees) ; les textes d'une invitation recue restent du contenu HOSTILE : ils ne sont affiches qu'en TEXTE (React), jamais en HTML.

export type Status = "accepted" | "tentative" | "declined" | "needs-action";
export interface CalendarInfo { id: string; name: string; color: string | null; isDefault: boolean; isVisible: boolean; sortOrder: number; /** Adresse de la boite a laquelle appartient le calendrier. */ mailboxAddress?: string; /** Agenda d'un compte externe : lecture seule, lu chez le fournisseur. */ readOnly?: boolean }
export interface Participant { email: string; name: string; status: Status; isOrganizer: boolean; isMe: boolean }
export interface Recurrence { frequency: "daily" | "weekly" | "monthly" | "yearly"; interval: number; count: number | null; until: string | null; byDay: string[] }
export interface CalEvent {
  id: string; uid: string; calendarId: string | null; title: string; description: string; location: string;
  /** Heure LOCALE de l'evenement (`YYYY-MM-DDTHH:mm:ss`) dans `timeZone` ; `null` = heure flottante (fuseau de l'utilisateur). */
  start: string; timeZone: string | null; duration: string; allDay: boolean;
  recurrence: Recurrence | null; recurrenceId: string | null;
  participants: Participant[]; organizerEmail: string | null; myStatus: Status | null; isOrganizer: boolean;
  status: "confirmed" | "tentative" | "cancelled" | null;
  /** Evenement d'un agenda externe : lecture seule. */
  readOnly?: boolean;
}
/** Contact avec une date d'anniversaire (calendrier « Anniversaires ») ; `standalone` = fiche creee seulement pour l'anniversaire (pas dans le carnet). */
export interface BirthdayContact { id: string; name: string; birthday: { month: number; day: number; year: number | null }; standalone: boolean }
export interface EventInput {
  calendarId: string; title: string; description: string; location: string; allDay: boolean; start: string; timeZone: string;
  durationMinutes: number; days: number; recurrence: RecurrenceInput | null; participants: { email: string; name?: string }[];
}
export interface RecurrenceInput { frequency: Recurrence["frequency"]; interval?: number; count?: number; until?: string; byDay?: string[] }

export interface ApiError { status: number; error?: string; code?: string; details?: unknown }
export type ApiResult<T> = { data: T; error: null } | { data: null; error: ApiError };

/** Date d'anniversaire ; l'annee est facultative. */
export interface Birthday { month: number; day: number; year: number | null }
