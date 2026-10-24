import { describe, expect, it } from "vitest";
import { findDuplicates, mergeContacts, pickPrimary } from "./duplicates";
import type { Contact } from "./api";

const c = (id: string, first: string, last: string, over: Partial<Contact> = {}): Contact => ({ id, firstName: first, lastName: last, name: `${first} ${last}`.trim(), company: "", jobTitle: "", notes: "", emails: [{ address: `${id}@x.test`, label: "work" }], phones: [], addresses: [], birthday: null, hasPhoto: false, favorite: false, createdAt: null, ...over });

describe("detection des doublons", () => {
  it("meme adresse (sans tenir compte de la casse) = doublon certain ; meme nom seulement = possible ; liens composes en un groupe", () => {
    const list = [
      c("1", "Marie", "Dupont", { emails: [{ address: "marie@x.test", label: "work" }] }),
      c("2", "M.", "Dupont", { emails: [{ address: "MARIE@x.test", label: "home" }, { address: "m@y.test", label: "home" }] }),
      c("3", "Marie", "D", { emails: [{ address: "m@y.test", label: "other" }] }),
      c("4", "Éloïse", "Martin", { emails: [{ address: "e1@x.test", label: "work" }] }),
      c("5", "eloise", "MARTIN", { emails: [{ address: "e2@x.test", label: "work" }] }),
      c("6", "Seul", "Contact"),
    ];
    const groups = findDuplicates(list);
    expect(groups.map((g) => [g.ids.slice().sort().join(","), g.reason]).sort()).toEqual([["1,2,3", "email"], ["4,5", "name"]]);
  });
  it("pas de doublon : noms partiels, fiches sans nom, adresses differentes", () => {
    expect(findDuplicates([c("1", "Anne", ""), c("2", "Anne", ""), c("3", "", "Dupont"), c("4", "", "Dupont")])).toEqual([]);
    expect(findDuplicates([])).toEqual([]);
  });
});

describe("fiche conservee et fusion", () => {
  it("garde en priorite un collegue, puis la photo, puis la plus renseignee, puis la plus ancienne", () => {
    const a = c("a", "A", "A", { createdAt: "2026-01-01" }), b = c("b", "B", "B", { hasPhoto: true }), d = c("d", "D", "D", { company: "X", notes: "n", createdAt: "2025-01-01" });
    expect(pickPrimary([a, b, d]).id).toBe("b");
    expect(pickPrimary([a, d]).id).toBe("d");
    expect(pickPrimary([a, c("e", "E", "E", { createdAt: "2024-01-01" })]).id).toBe("e");
    expect(pickPrimary([a, b, d], (x) => x.id === "a").id).toBe("a");
  });
  it("reunit les adresses, telephones (memes chiffres), adresses postales et notes sans doublon ; complete ce qui manque ; garde l'anniversaire", () => {
    const p = c("p", "Marie", "", { company: "", emails: [{ address: "a@x.test", label: "work" }], phones: [{ number: "06 12 34 56 78", label: "mobile" }], notes: "Cliente VIP" });
    const o = c("o", "Marie", "Dupont", {
      company: "Zeta", jobTitle: "DG", emails: [{ address: "A@x.test", label: "home" }, { address: "b@x.test", label: "home" }],
      phones: [{ number: "0612345678", label: "home" }, { number: "+33 1 02 03 04 05", label: "work" }],
      addresses: [{ street: "1 rue A", postalCode: "75001", city: "Paris", country: "", label: "home" }],
      notes: "cliente vip", birthday: { month: 3, day: 4, year: null },
    });
    const m = mergeContacts(p, [o]);
    expect([m.firstName, m.lastName, m.company, m.jobTitle]).toEqual(["Marie", "Dupont", "Zeta", "DG"]);
    expect(m.emails).toEqual([{ address: "a@x.test", label: "work" }, { address: "b@x.test", label: "home" }]);
    expect(m.phones.map((x) => x.number)).toEqual(["06 12 34 56 78", "+33 1 02 03 04 05"]);
    expect(m.addresses).toHaveLength(1);
    expect(m.notes).toBe("Cliente VIP");
    expect(m.birthday).toEqual({ month: 3, day: 4, year: null });
    expect(mergeContacts(p, [{ ...o, notes: "Rappeler en mai" }]).notes).toBe("Cliente VIP\n\nRappeler en mai"); // une note differente est conservee
  });
  it("respecte les bornes du serveur (10 adresses, 10 telephones, 3 adresses postales)", () => {
    const many = c("m", "A", "B", { emails: Array.from({ length: 10 }, (_, i) => ({ address: `m${i}@x.test`, label: "work" as const })) });
    const more = c("n", "A", "B", { emails: Array.from({ length: 10 }, (_, i) => ({ address: `n${i}@x.test`, label: "work" as const })) });
    expect(mergeContacts(many, [more]).emails).toHaveLength(10);
  });
});
