import type { ApiResult } from "../calendar/types";
import type { Birthday } from "../calendar/types";

// Contacts et listes de diffusion (miroir de apps/api/src/lib/contacts.ts). Tout vient du serveur deja valide et borne ; les noms et notes d'un contact
// peuvent venir d'un fichier importe ou d'un message : ils ne sont affiches qu'en TEXTE (React), jamais en HTML.

export type EmailLabel = "work" | "home" | "other";
export type PhoneLabel = "work" | "home" | "mobile" | "other";
export interface PostalAddress { street: string; postalCode: string; city: string; country: string; label: EmailLabel }
export interface ContactInput {
  firstName: string; lastName: string; company: string; jobTitle: string; notes: string;
  emails: { address: string; label: EmailLabel }[];
  phones: { number: string; label: PhoneLabel }[];
  addresses: PostalAddress[];
  birthday: Birthday | null;
}
export interface Contact extends ContactInput {
  id: string; /** Nom affiche. */ name: string;
  /** Une photo est enregistree chez Volcanium Cloud (l'image se lit a part : `loadContactPhoto`). */ hasPhoto: boolean;
  /** Dans les favoris. */ favorite: boolean;
  /** Date de creation (tri), `null` si inconnue. */ createdAt: string | null;
}
export interface ContactList { id: string; name: string; addresses: string[] }
export interface ListInput { name: string; addresses: string[] }
export interface ImportResult { created: number; skipped: number; limited: number; invalid: number; truncated: boolean }

export const MAX_BULK = 100;
export const MAX_CONTACTS = 5000;
export const MAX_LIST_ADDRESSES = 500;
export const MAX_IMPORT_ENTRIES = 2000;
export const MAX_IMPORT_CHARS = 1_800_000;

export type ContactsCall = <T>(path: string, init?: RequestInit) => Promise<ApiResult<T>>;

const json = (method: string, body: unknown): RequestInit => ({ method, body: JSON.stringify(body) });
const seg = (v: string) => encodeURIComponent(v);

/**
 * Client des contacts. `prefix` = debut des routes dans l'API de l'hote (`/mail/contacts` dans Mail, `/contacts` dans Communication) ;
 * `baseUrl` = adresse de cette API, pour les lectures brutes (photo, export) ; `call` = son appel JSON.
 */
export function createContactsApi(call: ContactsCall, baseUrl: string, prefix: string) {
  const p = prefix;
  // Photos de contact en URL locale, gardees pour la session (invalidees quand la photo change) : un contact sans photo n'est jamais demande.
  const cache = new Map<string, Promise<string | null>>();
  let revision = 0;
  const listeners = new Set<() => void>();
  const forget = (id: string): void => { cache.delete(id); revision++; listeners.forEach((fn) => fn()); };
  function loadPhoto(id: string): Promise<string | null> {
    const hit = cache.get(id);
    if (hit) return hit;
    const photo = fetch(`${baseUrl}${p}/${seg(id)}/photo`, { credentials: "include" })
      .then(async (res) => (res.ok && (res.headers.get("content-type") ?? "").startsWith("image/") ? URL.createObjectURL(await res.blob()) : null))
      .catch(() => null);
    cache.set(id, photo);
    return photo;
  }
  return {
  /** `photos` : Volcanium Cloud est configure, une photo de contact peut etre enregistree. */
  all: () => call<{ contacts: Contact[]; lists: ContactList[]; photos: boolean }>(`${p}`),
  /** Supprimer, ajouter aux favoris ou en retirer, pour des fiches selectionnees (100 au plus par appel). */
  bulk: (action: "delete" | "favorite" | "unfavorite", ids: string[]) => call<{ done: number; failed: number }>(`${p}/bulk`, json("POST", { action, ids })),
  create: (input: ContactInput) => call<{ contact: Contact }>(`${p}`, json("POST", input)),
  /** Anniversaire sans contact : une fiche « anniversaire seulement », absente du carnet. */
  createBirthday: (input: { firstName: string; lastName: string; birthday: Birthday }) => call<{ contact: Contact }>(`${p}/birthday`, json("POST", input)),
  update: (id: string, input: ContactInput) => call<{ contact: Contact }>(`${p}/${seg(id)}`, json("PATCH", input)),
  remove: (id: string) => call<{ ok: true }>(`${p}/${seg(id)}`, { method: "DELETE" }),
  createList: (input: ListInput) => call<{ list: ContactList }>(`${p}/lists`, json("POST", input)),
  updateList: (id: string, input: ListInput) => call<{ list: ContactList }>(`${p}/lists/${seg(id)}`, json("PATCH", input)),
  removeList: (id: string) => call<{ ok: true }>(`${p}/lists/${seg(id)}`, { method: "DELETE" }),
  /** Le fichier est lu par le navigateur et envoye en texte ; le format est choisi par l'utilisateur (jamais devine). */
  import: (format: "vcf" | "csv", content: string) => call<ImportResult>(`${p}/import`, json("POST", { format, content })),
  /** Photo (data URI JPEG/PNG/WebP de 150 Ko au plus, reduite par le navigateur avant l'envoi). */
  setPhoto: async (id: string, dataUrl: string) => { const r = await call<{ ok: true }>(`${p}/${seg(id)}/photo`, json("PUT", { dataUrl })); forget(id); return r; },
  removePhoto: async (id: string) => { const r = await call<{ ok: true }>(`${p}/${seg(id)}/photo`, { method: "DELETE" }); forget(id); return r; },
  /** Telecharge l'export (contacts et listes) : `null` en cas d'echec. */
  export: async (format: "vcf" | "csv"): Promise<Blob | null> => {
    try {
      const res = await fetch(`${baseUrl}${p}/export?format=${format}`, { credentials: "include" });
      return res.ok ? await res.blob() : null;
    } catch {
      return null;
    }
  },
    /** Photo d'un contact en URL locale, gardee pour la session (`null` : pas de photo). */
    loadPhoto,
    /** Les avatars se rechargent quand une photo change (la liste et la fiche montrent aussitot la nouvelle). */
    subscribePhotoChange: (fn: () => void): (() => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; },
    photoRevision: (): number => revision,
  };
}

export type ContactsApi = ReturnType<typeof createContactsApi>;
