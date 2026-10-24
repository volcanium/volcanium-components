import { describe, expect, it } from "vitest";
import type { CalEvent } from "./types";
import { formFrom, isEmail, newForm, recurrenceOf, toInput, validate, withPendingGuest, type FormState } from "./eventForm";
import { PALETTE, readableOn } from "./colors";

const ev = (over: Partial<CalEvent> = {}): CalEvent => ({
  id: "e", uid: "u", calendarId: "c1", title: "Reunion", description: "d", location: "Salle", start: "2030-03-12T14:00:00", timeZone: "Europe/Paris", duration: "PT1H30M", allDay: false,
  recurrence: null, recurrenceId: null, participants: [], organizerEmail: null, myStatus: null, isOrganizer: true, status: "confirmed", ...over,
});
const form = (over: Partial<FormState> = {}): FormState => ({ ...formFrom(ev()), ...over });

describe("nouvel evenement", () => {
  it("jour futur : 09:00-10:00 ; aujourd'hui : heure pleine suivante ; fuseau du navigateur fourni", () => {
    const f = newForm(new Date(2030, 2, 20), "c1", new Date(2030, 2, 12, 15, 40), "Europe/Paris");
    expect([f.startDate, f.startTime, f.endDate, f.endTime, f.timeZone, f.calendarId, f.allDay, f.repeat]).toEqual(["2030-03-20", "09:00", "2030-03-20", "10:00", "Europe/Paris", "c1", false, "none"]);
    const today = newForm(new Date(2030, 2, 12), "c1", new Date(2030, 2, 12, 15, 40), "Europe/Paris");
    expect([today.startTime, today.endTime]).toEqual(["16:00", "17:00"]);
    const late = newForm(new Date(2030, 2, 12), "c1", new Date(2030, 2, 12, 23, 10), "Europe/Paris");
    expect(late.startTime).toBe("22:00"); // jamais apres 22:00 : l'evenement tient dans la journee
    expect(late.endTime).toBe("23:00");
  });
});

describe("formulaire d'un evenement existant", () => {
  it("horaire : heures dans le fuseau PROPRE de l'evenement, fin = debut + duree", () => {
    const f = formFrom(ev(), "America/New_York");
    expect([f.startDate, f.startTime, f.endDate, f.endTime, f.timeZone]).toEqual(["2030-03-12", "14:00", "2030-03-12", "15:30", "Europe/Paris"]);
  });
  it("horaire qui passe minuit : la date de fin change", () => {
    const f = formFrom(ev({ start: "2030-03-12T23:00:00", duration: "PT3H" }));
    expect([f.startDate, f.endDate, f.endTime]).toEqual(["2030-03-12", "2030-03-13", "02:00"]);
  });
  it("journee entiere : fin INCLUSE (P3D du 20 -> jusqu'au 22)", () => {
    const f = formFrom(ev({ allDay: true, start: "2030-03-20T00:00:00", duration: "P3D", timeZone: null }), "Europe/Paris");
    expect([f.allDay, f.startDate, f.endDate]).toEqual([true, "2030-03-20", "2030-03-22"]);
    expect(formFrom(ev({ allDay: true, start: "2030-03-20T00:00:00", duration: "P1D", timeZone: null })).endDate).toBe("2030-03-20");
  });
  it("evenement flottant (sans fuseau) : fuseau du navigateur", () => {
    expect(formFrom(ev({ timeZone: null }), "Asia/Tokyo").timeZone).toBe("Asia/Tokyo");
  });
  it("serie : frequence, intervalle et fin lus de la regle", () => {
    const f = formFrom(ev({ recurrence: { frequency: "weekly", interval: 2, count: 5, until: null, byDay: [] } }));
    expect([f.repeat, f.interval, f.endKind, f.count]).toEqual(["weekly", 2, "count", 5]);
    const g = formFrom(ev({ recurrence: { frequency: "daily", interval: 1, count: null, until: "2030-03-20T23:59:59", byDay: [] } }));
    expect([g.endKind, g.until]).toEqual(["date", "2030-03-20"]);
    expect(formFrom(ev({ recurrence: { frequency: "yearly", interval: 1, count: null, until: null, byDay: [] } })).endKind).toBe("never");
  });
  it("invites : sans moi ; sans l'organisateur quand c'est moi", () => {
    const f = formFrom(ev({ participants: [
      { email: "moi@x.fr", name: "Moi", status: "accepted", isOrganizer: true, isMe: true },
      { email: "bob@x.fr", name: "Bob", status: "needs-action", isOrganizer: false, isMe: false },
    ] }));
    expect(f.guests).toEqual([{ email: "bob@x.fr", name: "Bob" }]);
  });
});

describe("validation", () => {
  it("titre obligatoire, fin apres le debut (fuseau compris), journee entiere : fin >= debut", () => {
    expect(validate(form())).toBeNull();
    expect(validate(form({ title: "   " }))).toBe("title");
    expect(validate(form({ endTime: "14:00" }))).toBe("time");
    expect(validate(form({ endTime: "13:59" }))).toBe("time");
    expect(validate(form({ endDate: "2030-03-11" }))).toBe("time");
    expect(validate(form({ allDay: true, startDate: "2030-03-12", endDate: "2030-03-12" }))).toBeNull();
    expect(validate(form({ allDay: true, startDate: "2030-03-12", endDate: "2030-03-11" }))).toBe("time");
  });
});

describe("corps envoye a l'API", () => {
  it("horaire : debut, fuseau, duree en minutes", () => {
    const b = toInput(form({ startTime: "09:00", endTime: "10:45" }));
    expect([b.start, b.timeZone, b.durationMinutes, b.allDay, b.title]).toEqual(["2030-03-12T09:00", "Europe/Paris", 105, false, "Reunion"]);
  });
  it("duree juste au changement d'heure d'ete (31 mars 2030, Paris : 02:00 devient 03:00)", () => {
    const b = toInput(form({ startDate: "2030-03-31", endDate: "2030-03-31", startTime: "01:00", endTime: "04:00" }));
    expect(b.durationMinutes).toBe(120); // l'heure 02:00-03:00 n'existe pas
  });
  it("journee entiere : jours inclusifs, debut a minuit", () => {
    const b = toInput(form({ allDay: true, startDate: "2030-03-20", endDate: "2030-03-22" }));
    expect([b.allDay, b.start, b.days]).toEqual([true, "2030-03-20T00:00", 3]);
    expect(toInput(form({ allDay: true, startDate: "2030-03-20", endDate: "2030-03-20" })).days).toBe(1);
  });
  it("repetition et invites ; titre rogne", () => {
    const b = toInput(form({ title: "  T  ", repeat: "weekly", interval: 2, endKind: "count", count: 4, guests: [{ email: "bob@x.fr", name: "Bob" }, { email: "al@x.fr", name: "" }] }));
    expect(b.title).toBe("T");
    expect(b.recurrence).toEqual({ frequency: "weekly", interval: 2, count: 4 });
    expect(b.participants).toEqual([{ email: "bob@x.fr", name: "Bob" }, { email: "al@x.fr" }]);
    expect(recurrenceOf(form({ repeat: "none" }))).toBeNull();
    expect(recurrenceOf(form({ repeat: "daily", endKind: "date", until: "2030-04-01" }))).toEqual({ frequency: "daily", until: "2030-04-01" });
    expect(recurrenceOf(form({ repeat: "monthly" }))).toEqual({ frequency: "monthly" });
  });
  it("aller-retour : formFrom puis toInput redonne les memes horaires", () => {
    const e = ev({ start: "2030-07-01T10:30:00", duration: "PT45M" });
    const b = toInput(formFrom(e));
    expect([b.start, b.durationMinutes, b.timeZone]).toEqual(["2030-07-01T10:30", 45, "Europe/Paris"]);
  });
});

describe("adresses et couleurs", () => {
  it("adresses d'invites", () => {
    for (const ok of ["a@b.fr", "jean.dupont@societe.co.uk", " x@y.eu "]) expect(isEmail(ok), ok).toBe(true);
    for (const bad of ["", "a", "a@b", "a@@b.fr", "a b@c.fr", "<a@b.fr>", "a@b.f"]) expect(isEmail(bad), bad).toBe(false);
  });
  it("texte lisible sur chaque couleur de la palette, et sur une couleur illisible a l'entree", () => {
    for (const c of PALETTE) expect(["#ffffff", "#111827"]).toContain(readableOn(c));
    expect(readableOn("#ffffff")).toBe("#111827");
    expect(readableOn("#000000")).toBe("#ffffff");
    expect(readableOn("rouge")).toBe(readableOn("#2563eb"));
  });
});

describe("invite tape mais pas ajoute", () => {
  const bob = { email: "bob@x.fr", name: "Bob" };
  it("l'adresse du champ est ajoutee a l'enregistrement (sinon l'invitation ne part jamais)", () => {
    expect(withPendingGuest([], "  Alice@Ext.FR ", () => "Alice")).toEqual([{ email: "alice@ext.fr", name: "Alice" }]);
    expect(withPendingGuest([bob], "al@x.fr")).toEqual([bob, { email: "al@x.fr", name: "" }]);
  });
  it("champ vide : liste inchangee ; doublon ignore ; adresse invalide : null", () => {
    expect(withPendingGuest([bob], "   ")).toEqual([bob]);
    expect(withPendingGuest([bob], "BOB@x.fr")).toEqual([bob]);
    expect(withPendingGuest([bob], "pas une adresse")).toBeNull();
    expect(withPendingGuest([], "a@b")).toBeNull();
  });
  it("le corps envoye contient bien l'invite ajoute automatiquement", () => {
    const guests = withPendingGuest([], "invite@ext.fr")!;
    expect(toInput(form({ guests })).participants).toEqual([{ email: "invite@ext.fr" }]);
  });
});
