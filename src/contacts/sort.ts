import type { Contact } from "./api";

// Tri et filtre de la liste des contacts (comme les filtres de la liste des messages). Fonctions pures, testees.

export type ContactSortKey = "name-asc" | "name-desc" | "first-asc" | "company-asc" | "recent" | "oldest";
export const CONTACT_SORT_KEYS: ContactSortKey[] = ["name-asc", "name-desc", "first-asc", "company-asc", "recent", "oldest"];
/** Tri des listes de diffusion. */
export type ListSortKey = "name-asc" | "name-desc" | "size-desc" | "size-asc";
export const LIST_SORT_KEYS: ListSortKey[] = ["name-asc", "name-desc", "size-desc", "size-asc"];
export type OriginFilter = "all" | "internal" | "external";

/** Contact EXTERNE de l'entreprise (client, fournisseur...) cree dans Entreprise : affiche avec les collegues, marque « Externe », en lecture seule. */
export interface ExternalInfo { company?: string | null; jobTitle?: string | null; phone?: string | null }
/** Une personne de l'annuaire : un collegue, ou (avec `external`) un contact externe de l'entreprise. */
export interface DirectoryPerson { name: string; email: string; external?: ExternalInfo }

/** Une ligne de la liste : un contact de l'utilisateur, ou un collegue de l'annuaire de l'entreprise (lecture seule). */
export type ContactRow =
  | { kind: "contact"; id: string; name: string; contact: Contact; internal: boolean }
  | { kind: "member"; id: string; name: string; email: string; internal: boolean; external?: ExternalInfo };

const collator = new Intl.Collator("fr", { sensitivity: "base", numeric: true });
const keyOf = (r: ContactRow): { first: string; company: string; created: number } =>
  r.kind === "contact"
    ? { first: r.contact.firstName || r.contact.lastName || r.name, company: r.contact.company, created: r.contact.createdAt ? Date.parse(r.contact.createdAt) : 0 }
    : { first: r.name, company: "", created: 0 };

export function sortRows(rows: readonly ContactRow[], sort: ContactSortKey): ContactRow[] {
  const out = rows.map((r, i) => ({ r, i, k: keyOf(r) }));
  const byName = (a: { r: ContactRow }, b: { r: ContactRow }) => collator.compare(a.r.name, b.r.name);
  out.sort((a, b) => {
    switch (sort) {
      case "name-desc": return byName(b, a);
      case "first-asc": return collator.compare(a.k.first, b.k.first) || byName(a, b);
      // Les fiches sans societe vont en bas : un tri par societe sert a regrouper celles qui en ont.
      case "company-asc": return (a.k.company ? 0 : 1) - (b.k.company ? 0 : 1) || collator.compare(a.k.company, b.k.company) || byName(a, b);
      // Date de creation ; a defaut (carte creee ailleurs, collegue de l'annuaire) l'ordre d'origine, les collegues apres.
      case "recent": return b.k.created - a.k.created || b.i - a.i;
      case "oldest": return a.k.created - b.k.created || a.i - b.i;
      default: return byName(a, b);
    }
  });
  return out.map((x) => x.r);
}

export const filterRows = (rows: readonly ContactRow[], origin: OriginFilter): ContactRow[] =>
  origin === "all" ? [...rows] : rows.filter((r) => (origin === "internal") === r.internal);

/** Lignes de la liste : les contacts de l'utilisateur (« interne » si une de leurs adresses est a l'entreprise) puis les collegues de l'annuaire qu'il n'a pas deja en contact. */
export function buildRows(contacts: readonly Contact[], members: readonly DirectoryPerson[], isInternal: (email: string) => boolean): ContactRow[] {
  const have = new Set(contacts.flatMap((c) => c.emails.map((e) => e.address)));
  return [
    ...contacts.map((c): ContactRow => ({ kind: "contact", id: c.id, name: c.name, contact: c, internal: c.emails.some((e) => isInternal(e.address)) })),
    ...members.filter((m) => !have.has(m.email.toLowerCase())).map((m): ContactRow => ({ kind: "member", id: `m:${m.email}`, name: m.name || m.email, email: m.email.toLowerCase(), internal: !m.external, ...(m.external ? { external: m.external } : {}) })),
  ];
}

/** Listes de diffusion triees par nom ou par nombre d'adresses (a egalite : par nom). */
export function sortLists<T extends { name: string; addresses: readonly unknown[] }>(lists: readonly T[], sort: ListSortKey): T[] {
  const byName = (a: T, b: T) => collator.compare(a.name, b.name);
  return [...lists].sort((a, b) => (sort === "name-desc" ? byName(b, a) : sort === "size-desc" ? b.addresses.length - a.addresses.length || byName(a, b) : sort === "size-asc" ? a.addresses.length - b.addresses.length || byName(a, b) : byName(a, b)));
}
