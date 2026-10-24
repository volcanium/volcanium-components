import { describe, expect, it } from "vitest";
import { birthdayContactId, birthdayEvents, birthdayFromFields, formatBirthday, isBirthdayEvent } from "./birthdays";

const title = (name: string, age: number | null) => (age === null ? name : `${name} ${age}`);

describe("birthdayEvents", () => {
  it("un evenement journee entiere par contact et par an, age seulement si l'annee est connue et passee", () => {
    const e = birthdayEvents([{ id: "c1", name: "Marie", birthday: { month: 5, day: 17, year: 1985 } }, { id: "c2", name: "Paul", birthday: { month: 1, day: 2, year: null } }], [2025, 2026], title);
    expect(e.map((x) => [x.id, x.title, x.start.slice(0, 10), x.allDay])).toEqual([
      ["bday:c1:2025", "Marie 40", "2025-05-17", true], ["bday:c1:2026", "Marie 41", "2026-05-17", true],
      ["bday:c2:2025", "Paul", "2025-01-02", true], ["bday:c2:2026", "Paul", "2026-01-02", true],
    ]);
    expect(isBirthdayEvent(e[0]!)).toBe(true);
    expect(birthdayContactId(e[0]!)).toBe("c1");
  });
  it("pas d'age l'annee de naissance ni avant ; 29 fevrier = 28 les annees non bissextiles", () => {
    const born = birthdayEvents([{ id: "c", name: "B", birthday: { month: 3, day: 1, year: 2026 } }], [2025, 2026, 2027], title);
    expect(born.map((x) => x.title)).toEqual(["B", "B", "B 1"]);
    const leap = birthdayEvents([{ id: "c", name: "L", birthday: { month: 2, day: 29, year: null } }], [2024, 2025, 2100], title);
    expect(leap.map((x) => x.start.slice(0, 10))).toEqual(["2024-02-29", "2025-02-28", "2100-02-28"]);
  });
});

describe("birthdayFromFields", () => {
  it("annee facultative, jour et mois obligatoires, dates impossibles refusees", () => {
    expect(birthdayFromFields({ day: "", month: "", year: "" })).toBeNull();
    expect(birthdayFromFields({ day: "17", month: "5", year: "" })).toEqual({ month: 5, day: 17, year: null });
    expect(birthdayFromFields({ day: "17", month: "5", year: "1985" })).toEqual({ month: 5, day: 17, year: 1985 });
    expect(birthdayFromFields({ day: "29", month: "2", year: "" })).toEqual({ month: 2, day: 29, year: null });
    for (const bad of [{ day: "17", month: "", year: "" }, { day: "", month: "5", year: "" }, { day: "", month: "", year: "1985" }, { day: "30", month: "2", year: "" }, { day: "29", month: "2", year: "1991" }, { day: "31", month: "4", year: "" }, { day: "1", month: "13", year: "" }, { day: "1", month: "1", year: "85" }, { day: "0", month: "1", year: "" }])
      expect(birthdayFromFields(bad)).toBe("invalid");
  });
});

describe("formatBirthday", () => {
  it("sans annee, le jour et le mois seulement", () => {
    expect(formatBirthday({ month: 5, day: 17, year: null }, "fr")).toBe("17 mai");
    expect(formatBirthday({ month: 5, day: 17, year: 1985 }, "fr")).toBe("17 mai 1985");
  });
});
