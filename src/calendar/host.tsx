import { createContext, useContext, type ReactNode } from "react";
import type { CalendarApi } from "./api";
import type { CalendarKey } from "./messages";
import type { Birthday } from "./types";

/** Carnet d'adresses de l'hote, pour les anniversaires : un anniversaire vit sur un contact (source unique), le calendrier ne stocke rien. */
export interface CalendarPeople {
  /** Contacts auxquels rattacher un anniversaire. */
  contacts: readonly { id: string; name: string; birthday: Birthday | null }[];
  /** `editingId` = fiche « anniversaire seulement » a modifier ; `contactId` = contact existant a completer ; sinon creation d'une fiche. Renvoie `false` en cas d'echec. */
  save(input: { editingId?: string; contactId?: string; name: string; birthday: Birthday }): Promise<boolean>;
  remove(contactId: string): Promise<boolean>;
}

/** Tout ce que le calendrier demande a l'application qui l'heberge. */
export interface CalendarHost {
  api: CalendarApi;
  t: (key: CalendarKey, params?: Record<string, string | number>) => string;
  locale: string;
  /** Prefixe des reglages retenus dans le navigateur (vue, agendas masques...) : une valeur par application, ex. `vm`. */
  storagePrefix: string;
  /** Collegues proposes comme invites. */
  members: readonly { email: string; name: string }[];
  /** Propose « reunion video Volcanium » (l'hote a Communication). */
  videoMeetings: boolean;
  /** Ouvre la fiche d'un contact (clic sur un anniversaire). */
  openContact(contactId: string): void;
  people: CalendarPeople;
}

const Ctx = createContext<CalendarHost | null>(null);

export function CalendarHostProvider({ host, children }: { host: CalendarHost; children: ReactNode }) {
  return <Ctx.Provider value={host}>{children}</Ctx.Provider>;
}

export function useCalendarHost(): CalendarHost {
  const h = useContext(Ctx);
  if (!h) throw new Error("CalendarHostProvider manquant");
  return h;
}

/** Texte et langue du calendrier (meme forme que le `useI18n` des applications). */
export const useI18n = () => { const { t, locale } = useCalendarHost(); return { t, locale }; };
export const useCalendarApi = (): CalendarApi => useCalendarHost().api;
