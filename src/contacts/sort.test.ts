import { describe, expect, it } from "vitest";
import { buildRows, filterRows, sortLists, sortRows } from "./sort";
import type { Contact } from "./api";

const c = (id: string, first: string, last: string, over: Partial<Contact> = {}): Contact => ({ id, firstName: first, lastName: last, name: `${first} ${last}`.trim(), company: "", jobTitle: "", notes: "", emails: [{ address: `${id}@x.test`, label: "work" }], phones: [], addresses: [], birthday: null, hasPhoto: false, favorite: false, createdAt: null, ...over });
const contacts = [
  c("1", "Marie", "Dupont", { company: "Zeta", createdAt: "2026-01-02T00:00:00Z" }),
  c("2", "Paul", "Adam", { company: "Alpha", createdAt: "2026-03-01T00:00:00Z" }),
  c("3", "Zoé", "Bernard", { createdAt: "2026-02-01T00:00:00Z", emails: [{ address: "zoe@volcanium.eu", label: "work" }] }),
  c("4", "Anne", "", { createdAt: null }),
];
const members = [{ name: "Léa Colleague", email: "lea@volcanium.eu" }, { name: "Zoé Bernard", email: "ZOE@volcanium.eu" }];
const rows = buildRows(contacts, members, (e) => e.endsWith("@volcanium.eu"));
const names = (r: ReturnType<typeof sortRows>) => r.map((x) => x.name);

describe("liste des contacts", () => {
  it("contacts de l'utilisateur + collegues de l'annuaire, sans doublon (un collegue deja en contact n'apparait qu'une fois), tag interne selon les adresses", () => {
    expect(rows.map((r) => [r.id, r.kind, r.internal])).toEqual([["1", "contact", false], ["2", "contact", false], ["3", "contact", true], ["4", "contact", false], ["m:lea@volcanium.eu", "member", true]]);
  });
  it("tri par nom (A-Z, Z-A) sans tenir compte des accents ni de la casse", () => {
    expect(names(sortRows(rows, "name-asc"))).toEqual(["Anne", "Léa Colleague", "Marie Dupont", "Paul Adam", "Zoé Bernard"]);
    expect(names(sortRows(rows, "name-desc"))).toEqual(["Zoé Bernard", "Paul Adam", "Marie Dupont", "Léa Colleague", "Anne"]);
  });
  it("tri par prenom, par societe (sans societe en bas), recents et plus anciens (sans date en dernier / en premier)", () => {
    expect(names(sortRows(rows, "first-asc"))).toEqual(["Anne", "Léa Colleague", "Marie Dupont", "Paul Adam", "Zoé Bernard"]);
    expect(names(sortRows(rows, "company-asc")).slice(0, 2)).toEqual(["Paul Adam", "Marie Dupont"]);
    expect(names(sortRows(rows, "recent")).slice(0, 3)).toEqual(["Paul Adam", "Zoé Bernard", "Marie Dupont"]);
    expect(names(sortRows(rows, "oldest")).slice(-3)).toEqual(["Marie Dupont", "Zoé Bernard", "Paul Adam"]);
  });
  it("filtre d'origine : tous, internes, externes", () => {
    expect(filterRows(rows, "all").length).toBe(5);
    expect(names(filterRows(rows, "internal")).sort()).toEqual(["Léa Colleague", "Zoé Bernard"]);
    expect(names(filterRows(rows, "external")).sort()).toEqual(["Anne", "Marie Dupont", "Paul Adam"]);
  });
  it("ne modifie pas la liste d'origine", () => {
    const before = rows.map((r) => r.id);
    sortRows(rows, "name-desc"); filterRows(rows, "internal");
    expect(rows.map((r) => r.id)).toEqual(before);
  });
  it("listes de diffusion : tri par nom (A-Z, Z-A) et par nombre d'adresses, a egalite par nom, sans modifier l'original", () => {
    const lists = [{ name: "Famille", addresses: ["a", "b"] }, { name: "équipe", addresses: ["a", "b", "c", "d"] }, { name: "Asso", addresses: ["a", "b"] }];
    expect(sortLists(lists, "name-asc").map((l) => l.name)).toEqual(["Asso", "équipe", "Famille"]);
    expect(sortLists(lists, "name-desc").map((l) => l.name)).toEqual(["Famille", "équipe", "Asso"]);
    expect(sortLists(lists, "size-desc").map((l) => l.name)).toEqual(["équipe", "Asso", "Famille"]);
    expect(sortLists(lists, "size-asc").map((l) => l.name)).toEqual(["Asso", "Famille", "équipe"]);
    expect(lists.map((l) => l.name)).toEqual(["Famille", "équipe", "Asso"]);
  });
});
