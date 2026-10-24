import { describe, expect, it } from "vitest";
import type { CalEvent } from "./types";
import { addDays, atMinutes, busyDays, chunkDays, dayKey, isMovable, minutesNow, movedStart, sameTimeOnDay, snapMinutes, yearDays, yearMonths, epochToZoned, eventSpan, eventsByDay, fromDayKey, layoutDay, monthGrid, parseDuration, queryRange, weekDays, zonedToEpoch } from "./time";

const ev = (over: Partial<CalEvent> = {}): CalEvent => ({
  id: "e", uid: "u", calendarId: "c", title: "T", description: "", location: "", start: "2030-03-12T14:00:00", timeZone: "Europe/Paris", duration: "PT1H", allDay: false,
  recurrence: null, recurrenceId: null, participants: [], organizerEmail: null, myStatus: null, isOrganizer: true, status: "confirmed", ...over,
});

describe("durees ISO 8601", () => {
  it("heures, minutes, jours, illisible", () => {
    expect(parseDuration("PT1H")).toBe(60);
    expect(parseDuration("PT1H30M")).toBe(90);
    expect(parseDuration("PT45M")).toBe(45);
    expect(parseDuration("P2D")).toBe(2880);
    expect(parseDuration("P1DT2H")).toBe(1560);
    expect(parseDuration("PT0S")).toBe(0);
    expect(parseDuration("n'importe quoi")).toBe(0);
  });
});

describe("fuseaux horaires", () => {
  it("Paris : +1 h en hiver, +2 h en ete (UTC)", () => {
    expect(new Date(zonedToEpoch("2030-03-12T14:00:00", "Europe/Paris")).toISOString()).toBe("2030-03-12T13:00:00.000Z");
    expect(new Date(zonedToEpoch("2030-07-01T14:00:00", "Europe/Paris")).toISOString()).toBe("2030-07-01T12:00:00.000Z");
    expect(new Date(zonedToEpoch("2030-07-01T14:00", "Europe/Paris")).toISOString()).toBe("2030-07-01T12:00:00.000Z"); // sans secondes
  });
  it("autres fuseaux, dont decalages a la demi-heure", () => {
    expect(new Date(zonedToEpoch("2030-03-12T09:00:00", "America/New_York")).toISOString()).toBe("2030-03-12T13:00:00.000Z"); // EDT : mars 2030 apres le 10 mars
    expect(new Date(zonedToEpoch("2030-01-15T12:00:00", "Asia/Kolkata")).toISOString()).toBe("2030-01-15T06:30:00.000Z");
    expect(new Date(zonedToEpoch("2030-01-15T12:00:00", "UTC")).toISOString()).toBe("2030-01-15T12:00:00.000Z");
  });
  it("changement d'heure : l'heure d'ete commence le dernier dimanche de mars a 02:00 -> 03:00", () => {
    expect(new Date(zonedToEpoch("2030-03-31T01:30:00", "Europe/Paris")).toISOString()).toBe("2030-03-31T00:30:00.000Z"); // encore CET
    expect(new Date(zonedToEpoch("2030-03-31T03:30:00", "Europe/Paris")).toISOString()).toBe("2030-03-31T01:30:00.000Z"); // deja CEST
  });
  it("aller-retour instant <-> heure locale", () => {
    for (const [local, tz] of [["2030-03-12T14:00:00", "Europe/Paris"], ["2030-10-27T02:30:00", "America/Sao_Paulo"], ["2030-12-31T23:59:00", "Pacific/Auckland"], ["2030-06-15T00:00:00", "UTC"]] as const) {
      expect(epochToZoned(zonedToEpoch(local, tz), tz)).toBe(local.length === 16 ? `${local}:00` : local);
    }
  });
  it("heure invalide -> NaN, jamais une date plausible", () => {
    expect(zonedToEpoch("demain", "Europe/Paris")).toBeNaN();
    expect(zonedToEpoch("2030-13-45T99:99:99", "UTC")).not.toBeNaN(); // forme valide, valeurs normalisees par JS : on ne s'en protege pas ici (le serveur valide)
  });
});

describe("intervalle d'un evenement", () => {
  it("evenement horaire : instants reels", () => {
    const s = eventSpan(ev());
    expect(s.allDay).toBe(false);
    expect(s.start.toISOString()).toBe("2030-03-12T13:00:00.000Z");
    expect(s.end.toISOString()).toBe("2030-03-12T14:00:00.000Z");
  });
  it("journee entiere : dates flottantes, fin EXCLUE", () => {
    const s = eventSpan(ev({ allDay: true, start: "2030-03-20T00:00:00", duration: "P2D", timeZone: null }));
    expect(dayKey(s.start)).toBe("2030-03-20");
    expect(dayKey(s.end)).toBe("2030-03-22");
    expect(dayKey(eventSpan(ev({ allDay: true, start: "2030-03-20T00:00:00", duration: "PT0S", timeZone: null })).end)).toBe("2030-03-21"); // au moins un jour
  });
});

describe("grilles", () => {
  it("mois : 42 jours, commence un lundi, contient tout le mois", () => {
    const g = monthGrid(new Date(2030, 2, 15)); // mars 2030 : le 1er est un vendredi
    expect(g).toHaveLength(42);
    expect(g[0]!.getDay()).toBe(1);
    expect(dayKey(g[0]!)).toBe("2030-02-25");
    expect(g.map(dayKey)).toContain("2030-03-31");
    expect(dayKey(g[41]!)).toBe("2030-04-07");
  });
  it("semaine : sept jours du lundi au dimanche", () => {
    const w = weekDays(new Date(2030, 2, 14)); // jeudi 14 mars 2030
    expect(w.map(dayKey)).toEqual(["2030-03-11", "2030-03-12", "2030-03-13", "2030-03-14", "2030-03-15", "2030-03-16", "2030-03-17"]);
    expect(weekDays(new Date(2030, 2, 17)).map(dayKey)[0]).toBe("2030-03-11"); // dimanche : meme semaine
  });
  it("cles de jour : aller-retour et arithmetique de dates sur un changement d'heure", () => {
    expect(dayKey(fromDayKey("2030-03-31"))).toBe("2030-03-31");
    expect(dayKey(addDays(fromDayKey("2030-03-30"), 2))).toBe("2030-04-01");
    expect(dayKey(addDays(fromDayKey("2030-12-31"), 1))).toBe("2031-01-01");
  });
});

describe("evenements par jour", () => {
  const days = weekDays(new Date(2030, 2, 14));
  it("un evenement sur plusieurs jours figure dans chaque jour, journee entiere en premier, puis par heure", () => {
    const m = eventsByDay([
      ev({ id: "b", title: "B", start: "2030-03-12T09:00:00" }),
      ev({ id: "a", title: "A", start: "2030-03-12T08:00:00" }),
      ev({ id: "j", title: "Voyage", allDay: true, start: "2030-03-12T00:00:00", duration: "P3D", timeZone: null }),
    ], days);
    expect(m.get("2030-03-12")!.map((x) => x.event.id)).toEqual(["j", "a", "b"]);
    expect(m.get("2030-03-13")!.map((x) => x.event.id)).toEqual(["j"]);
    expect(m.get("2030-03-14")!.map((x) => x.event.id)).toEqual(["j"]);
    expect(m.get("2030-03-15")).toEqual([]);
    expect(m.get("2030-03-11")).toEqual([]);
  });
  it("hors de la plage affichee : ignore ; heure illisible : ignoree", () => {
    const m = eventsByDay([ev({ id: "x", start: "2031-01-01T10:00:00" }), ev({ id: "y", start: "n'importe quoi" })], days);
    expect([...m.values()].every((l) => l.length === 0)).toBe(true);
  });
  it("evenement horaire qui passe minuit : present sur les deux jours", () => {
    const m = eventsByDay([ev({ id: "n", start: "2030-03-12T23:00:00", duration: "PT3H", timeZone: "UTC" })], days);
    const inDay = (k: string) => m.get(k)!.length;
    expect(inDay("2030-03-12") + inDay("2030-03-13")).toBeGreaterThanOrEqual(1);
  });
});

describe("disposition d'un jour (vue semaine)", () => {
  const day = new Date(2030, 2, 12);
  const at = (h: number, m = 0, dur = "PT1H", id = "e") => ev({ id, start: `2030-03-12T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`, timeZone: null, duration: dur });
  const items = (list: CalEvent[]) => list.map((event) => ({ event, span: eventSpan(event) }));
  it("evenements successifs : une seule colonne chacun", () => {
    const p = layoutDay(items([at(9, 0, "PT1H", "a"), at(10, 0, "PT1H", "b")]), day);
    expect(p.map((x) => [x.event.id, x.top, x.height, x.column, x.columns])).toEqual([["a", 540, 60, 0, 1], ["b", 600, 60, 0, 1]]);
  });
  it("evenements qui se chevauchent : colonnes distinctes, largeur partagee", () => {
    const p = layoutDay(items([at(9, 0, "PT2H", "a"), at(10, 0, "PT1H", "b"), at(10, 30, "PT1H", "c")]), day);
    const by = Object.fromEntries(p.map((x) => [x.event.id, x]));
    expect(new Set([by.a!.column, by.b!.column, by.c!.column]).size).toBe(3);
    expect(by.a!.columns).toBe(3);
    expect(Object.values(by).map((x) => x.span)).toEqual([1, 1, 1]);
  });
  it("evenement seul : pleine largeur ; trois evenements qui se chevauchent : une colonne chacun", () => {
    expect(layoutDay(items([at(9, 0, "PT1H", "a")]), day).map((x) => [x.column, x.columns, x.span])).toEqual([[0, 1, 1]]);
    const by = Object.fromEntries(layoutDay(items([at(9, 0, "PT3H", "a"), at(9, 0, "PT1H", "b"), at(9, 30, "PT1H", "c")]), day).map((x) => [x.event.id, x]));
    expect([by.a!.span, by.b!.span, by.c!.span]).toEqual([1, 1, 1]);
  });
  it("evenement tres court : hauteur minimale ; journee entiere : jamais dans la grille horaire", () => {
    expect(layoutDay(items([at(9, 0, "PT5M", "a")]), day)[0]!.height).toBe(20);
    expect(layoutDay(items([ev({ id: "j", allDay: true, start: "2030-03-12T00:00:00", duration: "P1D", timeZone: null })]), day)).toEqual([]);
  });
});

describe("plage interrogee", () => {
  it("couvre les jours affiches avec une marge, en UTC", () => {
    const r = queryRange(weekDays(new Date(2030, 2, 14)));
    expect(new Date(r.to).getTime()).toBeGreaterThan(new Date(r.from).getTime());
    expect(r.from).toMatch(/Z$/);
    expect((Date.parse(r.to) - Date.parse(r.from)) / 86_400_000).toBeLessThan(100);
  });
});

describe("deplacement a la souris", () => {
  it("pas de 15 minutes, borne a la journee", () => {
    expect(snapMinutes(7)).toBe(0);
    expect(snapMinutes(8)).toBe(15);
    expect(snapMinutes(22)).toBe(15);
    expect(snapMinutes(23)).toBe(30);
    expect(snapMinutes(-50)).toBe(0);
    expect(snapMinutes(99999)).toBe(1425);
    expect(snapMinutes(61, 30)).toBe(60);
  });
  it("seul l'organisateur deplace, hors serie et hors evenement annule", () => {
    const base = { isOrganizer: true, recurrence: null, recurrenceId: null, status: "confirmed" as const };
    expect(isMovable(base)).toBe(true);
    expect(isMovable({ ...base, isOrganizer: false })).toBe(false);
    expect(isMovable({ ...base, recurrenceId: "2030-03-12T14:00:00" })).toBe(false);
    expect(isMovable({ ...base, recurrence: { frequency: "weekly", interval: 1, count: null, until: null, byDay: [] } })).toBe(false);
    expect(isMovable({ ...base, status: "cancelled" })).toBe(false);
  });
  it("nouveau debut exprime dans le fuseau de l'evenement, pas dans celui du navigateur", () => {
    // depose le 15 mars 2030 a 10:00 heure de Paris (= 09:00 UTC) ; l'evenement vit a New York (EDT, UTC-4) -> 05:00 la-bas
    const target = new Date(Date.UTC(2030, 2, 15, 9, 0));
    expect(movedStart({ allDay: false, timeZone: "America/New_York" }, target, "Europe/Paris")).toEqual({ start: "2030-03-15T05:00", timeZone: "America/New_York" });
    expect(movedStart({ allDay: false, timeZone: "UTC" }, target, "Europe/Paris")).toEqual({ start: "2030-03-15T09:00", timeZone: "UTC" });
    expect(movedStart({ allDay: false, timeZone: null }, target, "Europe/Paris")).toEqual({ start: "2030-03-15T10:00", timeZone: "Europe/Paris" });
    expect(movedStart({ allDay: true, timeZone: null }, new Date(2030, 2, 20, 17), "Europe/Paris")).toEqual({ start: "2030-03-20T00:00", timeZone: "Europe/Paris" });
  });
  it("depot sur une case du mois : meme heure du jour ; journee entiere : minuit", () => {
    const span = eventSpan(ev({ start: "2030-03-12T14:30:00", timeZone: null }));
    const d = sameTimeOnDay(span, new Date(2030, 2, 20));
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes()]).toEqual([2030, 2, 20, 14, 30]);
    const all = sameTimeOnDay(eventSpan(ev({ allDay: true, start: "2030-03-12T00:00:00", duration: "P1D", timeZone: null })), new Date(2030, 2, 20, 15));
    expect([all.getDate(), all.getHours()]).toEqual([20, 0]);
  });
  it("depot sur la grille horaire : jour + minutes depuis minuit", () => {
    const t = atMinutes(new Date(2030, 2, 12, 17, 5), 9 * 60 + 45);
    expect([t.getDate(), t.getHours(), t.getMinutes()]).toEqual([12, 9, 45]);
  });
});

describe("annee et mini-calendrier", () => {
  it("12 mois, 365 ou 366 jours", () => {
    expect(yearMonths(2030).map((m) => m.getMonth())).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(yearDays(2030)).toHaveLength(365);
    expect(yearDays(2028)).toHaveLength(366);
    expect(dayKey(yearDays(2030)[0]!)).toBe("2030-01-01");
    expect(dayKey(yearDays(2030)[364]!)).toBe("2030-12-31");
  });
  it("decoupage en morceaux de 80 jours au plus, sans perte ni doublon", () => {
    const days = yearDays(2030);
    const chunks = chunkDays(days);
    expect(chunks.every((c) => c.length <= 80)).toBe(true);
    expect(chunks.flat().map(dayKey)).toEqual(days.map(dayKey));
    expect(chunks).toHaveLength(5);
  });
  it("jours occupes, evenement sur plusieurs jours compris", () => {
    const s = busyDays([ev({ start: "2030-03-12T10:00:00", timeZone: null }), ev({ id: "v", allDay: true, start: "2030-03-20T00:00:00", duration: "P3D", timeZone: null })]);
    expect([...s].sort()).toEqual(["2030-03-12", "2030-03-20", "2030-03-21", "2030-03-22"]);
  });
  it("minutes depuis minuit", () => {
    expect(minutesNow(new Date(2030, 0, 1, 7, 30))).toBe(450);
    expect(minutesNow(new Date(2030, 0, 1, 0, 0))).toBe(0);
  });
});
