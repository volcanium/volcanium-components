import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Contact, ContactList, ContactsApi } from "./api";

// Contacts et listes de l'utilisateur (ceux de Volcanium Mail, lus par notre API), partages entre la page « Contacts » et le formulaire d'anniversaire du calendrier.
// `enabled` faux (pas de lien avec Mail) : rien n'est demande. Un echec (ou pas de boite personnelle) n'est pas une erreur pour le calendrier.

export type ContactsState = "loading" | "ready" | "error" | "unavailable";
interface ContactsValue {
  state: ContactsState;
  contacts: Contact[];
  lists: ContactList[];
  /** Volcanium Cloud est configure : on peut choisir une photo de contact. */
  photosAvailable: boolean;
  reload: () => Promise<void>;
  /** Contact de l'utilisateur qui porte cette adresse (le premier). */
  findByEmail: (email: string) => Contact | undefined;
  /** Identifiant du contact qui porte cette adresse ET a une photo (sinon `undefined`). */
  photoContactId: (email: string) => string | undefined;
}

const ContactsContext = createContext<ContactsValue>({ state: "loading", contacts: [], lists: [], photosAvailable: false, reload: async () => undefined, findByEmail: () => undefined, photoContactId: () => undefined });

/** Contacts et listes, partages par la page Contacts, les propositions de destinataires et le calendrier. `enabled` faux : rien n'est demande. */
export function ContactsProvider({ api, enabled = true, children }: { api: ContactsApi; enabled?: boolean; children: ReactNode }) {
  const [state, setState] = useState<ContactsState>("loading");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [lists, setLists] = useState<ContactList[]>([]);
  const [photosAvailable, setPhotosAvailable] = useState(false);
  const reload = useCallback(async () => {
    if (!enabled) return;
    const { data, error } = await api.all();
    if (data) { setContacts(data.contacts); setLists(data.lists); setPhotosAvailable(data.photos); setState("ready"); }
    else setState(error.status === 404 ? "unavailable" : "error"); // 404 : pas de boite personnelle, donc pas de carnet
  }, [api, enabled]);
  useEffect(() => { void reload(); }, [reload]);
  const value = useMemo(() => {
    const byEmail = new Map<string, Contact>();
    for (const c of contacts) for (const e of c.emails) if (!byEmail.has(e.address)) byEmail.set(e.address, c);
    const findByEmail = (email: string) => byEmail.get(email.trim().toLowerCase());
    return { state, contacts, lists, photosAvailable, reload, findByEmail, photoContactId: (email: string) => { const c = findByEmail(email); return c?.hasPhoto ? c.id : undefined; } };
  }, [state, contacts, lists, reload]);
  return <ContactsContext.Provider value={value}>{children}</ContactsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useContacts = (): ContactsValue => useContext(ContactsContext);
