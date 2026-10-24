import { createContext, useContext, type ReactNode } from "react";
import type { ContactsApi } from "./api";
import type { Contact } from "./api";
import type { ContactsKey } from "./messages";

/** Un collegue de l'annuaire de l'entreprise (porte une adresse e-mail et peut recevoir un message ou un appel). */
export interface Colleague { id: string; name: string; email: string; image?: string | null; jobTitle?: string | null }

/** La fiche (ou la ligne d'annuaire) ouverte : ce que l'hote a besoin de savoir pour ses propres boutons et sections. */
export interface PersonContext {
  contact?: Contact;
  member?: { name: string; email: string };
  /** Collegue derriere la fiche. */
  colleague?: Colleague;
  /** Collegue joignable (message, appel) : un collegue qui n'est pas nous-memes. */
  reachable?: Colleague;
  /** C'est nous : notre profil se modifie dans Volcanium Compte. */
  self: boolean;
}

/** Tout ce que la page Contacts demande a l'application qui l'heberge. */
export interface ContactsHost {
  api: ContactsApi;
  t: (key: ContactsKey, params?: Record<string, string | number>) => string;
  locale: string;
  /** Annuaire de l'entreprise (lignes « collegue » de la liste). */
  members: readonly { name: string; email: string }[];
  colleagues: {
    find(email: string): Colleague | undefined;
    /** Adresse de l'entreprise : un membre, ou le domaine de notre propre adresse. */
    isInternal(email: string): boolean;
    isSelf(email: string): boolean;
  };
  /** Peut-on ecrire un e-mail depuis ici (boite en ecriture, ou Mail configure) ? */
  canWrite: boolean;
  /** Ouvre un nouveau message adresse a ces personnes (l'hote verifie la limite et choisit ou). */
  writeTo(addresses: string[]): void;
  /** Adresse de la page de profil dans Volcanium Compte. */
  manageAccountUrl: string;
  /** Photo ronde : `src` = photo choisie pour le contact, `colleague` = collegue porteur de l'adresse. */
  renderAvatar(p: { name: string; email?: string; src?: string | null; colleague?: Colleague; size: number }): ReactNode;
  /** Photo de l'annuaire pour cette adresse (hook : appele a chaque rendu, dans le meme ordre). */
  useColleaguePhoto(email: string | undefined): string | null;
  /** Boutons en plus a cote de « ecrire » (message, appels...). */
  renderActions?(p: PersonContext): ReactNode;
  /** Bloc de profil de l'annuaire, au-dessus des coordonnees. */
  renderProfile?(p: PersonContext): ReactNode;
  /** Sections sous la fiche (e-mails echanges, rendez-vous, appels...). */
  renderHistory?(p: PersonContext): ReactNode;
}

const Ctx = createContext<ContactsHost | null>(null);

export function ContactsHostProvider({ host, children }: { host: ContactsHost; children: ReactNode }) {
  return <Ctx.Provider value={host}>{children}</Ctx.Provider>;
}

export function useContactsHost(): ContactsHost {
  const h = useContext(Ctx);
  if (!h) throw new Error("ContactsHostProvider manquant");
  return h;
}

/** Texte et langue (meme forme que le `useI18n` des applications). */
export const useI18n = () => { const { t, locale } = useContactsHost(); return { t, locale }; };
