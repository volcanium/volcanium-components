import type { Contact, ContactInput } from "./api";
import { formatAddress } from "./address";

// Doublons parmi les contacts de l'utilisateur. Deux fiches sont liees si elles partagent une ADRESSE e-mail (doublon certain) ou le meme
// PRENOM + NOM (doublon possible : deux personnes peuvent porter le meme nom, l'utilisateur confirme). Les liens se composent : A~B et B~C
// donnent un seul groupe. Tout se calcule dans le navigateur, sur des fiches deja bornees par le serveur.

export interface DuplicateGroup { ids: string[]; /** `email` : une adresse en commun (certain) ; `name` : meme nom seulement (possible). */ reason: "email" | "name" }

const norm = (s: string): string => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
const digits = (s: string): string => s.replace(/[^0-9]/g, "").replace(/^00/, "");

export function findDuplicates(contacts: Contact[]): DuplicateGroup[] {
  const parent = new Map<string, string>(contacts.map((c) => [c.id, c.id]));
  const find = (x: string): string => { let r = x; while (parent.get(r) !== r) r = parent.get(r)!; parent.set(x, r); return r; };
  const union = (a: string, b: string) => { const ra = find(a), rb = find(b); if (ra !== rb) parent.set(ra, rb); };
  const byEmail = new Map<string, string>();
  const byName = new Map<string, string>();
  const emailLinked = new Set<string>();
  for (const c of contacts) {
    for (const e of c.emails) {
      const k = e.address.trim().toLowerCase();
      const other = byEmail.get(k);
      if (other && other !== c.id) { union(other, c.id); emailLinked.add(other); emailLinked.add(c.id); } else byEmail.set(k, c.id);
    }
    if (c.firstName.trim() && c.lastName.trim()) {
      const k = `${norm(c.firstName)}|${norm(c.lastName)}`;
      const other = byName.get(k);
      if (other && other !== c.id) union(other, c.id); else byName.set(k, c.id);
    }
  }
  const groups = new Map<string, string[]>();
  for (const c of contacts) groups.set(find(c.id), [...(groups.get(find(c.id)) ?? []), c.id]);
  return [...groups.values()].filter((ids) => ids.length > 1).map((ids) => ({ ids, reason: ids.some((id) => emailLinked.has(id)) ? "email" as const : "name" as const }));
}

const score = (c: Contact): number =>
  (c.company ? 1 : 0) + (c.jobTitle ? 1 : 0) + (c.notes ? 1 : 0) + c.emails.length + c.phones.length + c.addresses.length + (c.birthday ? 1 : 0);

/** La fiche qui reste : un collegue de l'annuaire (son nom vient de l'annuaire), puis celle qui a une photo, puis la plus renseignee, puis la plus ancienne. */
export function pickPrimary(group: Contact[], isColleague: (c: Contact) => boolean = () => false): Contact {
  return [...group].sort((a, b) =>
    Number(isColleague(b)) - Number(isColleague(a)) || Number(b.hasPhoto) - Number(a.hasPhoto) || score(b) - score(a) ||
    (a.createdAt ?? "9999").localeCompare(b.createdAt ?? "9999") || a.id.localeCompare(b.id))[0]!;
}

const first = <T,>(values: T[], ok: (v: T) => boolean): T | undefined => values.find(ok);

/** La fiche fusionnee : tout ce que `primary` a est garde ; ce qui manque est pris aux autres ; listes reunies sans doublon (bornes du serveur : 10, 10, 3). */
export function mergeContacts(primary: Contact, others: Contact[]): ContactInput {
  const all = [primary, ...others];
  const text = (pick: (c: Contact) => string): string => first(all.map(pick), (v) => v.trim() !== "")?.trim() ?? "";
  const notes: string[] = [];
  for (const n of all.map((c) => c.notes.trim()).filter(Boolean)) if (!notes.some((x) => norm(x) === norm(n) || norm(x).includes(norm(n)))) notes.push(n);
  const emails = new Map<string, ContactInput["emails"][number]>();
  for (const e of all.flatMap((c) => c.emails)) { const k = e.address.trim().toLowerCase(); if (!emails.has(k)) emails.set(k, { address: k, label: e.label }); }
  const phones = new Map<string, ContactInput["phones"][number]>();
  for (const p of all.flatMap((c) => c.phones)) { const k = digits(p.number); if (k && !phones.has(k)) phones.set(k, p); }
  const addresses = new Map<string, ContactInput["addresses"][number]>();
  for (const a of all.flatMap((c) => c.addresses)) { const k = norm(formatAddress(a)); if (k && !addresses.has(k)) addresses.set(k, a); }
  return {
    firstName: text((c) => c.firstName), lastName: text((c) => c.lastName), company: text((c) => c.company), jobTitle: text((c) => c.jobTitle),
    notes: notes.join("\n\n").slice(0, 5000),
    emails: [...emails.values()].slice(0, 10), phones: [...phones.values()].slice(0, 10), addresses: [...addresses.values()].slice(0, 3),
    birthday: first(all.map((c) => c.birthday), (b) => b !== null) ?? null,
  };
}
