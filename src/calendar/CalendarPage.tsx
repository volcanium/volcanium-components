import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Checkbox, FullPageLoader, IconButton, Modal, Notice, SegmentedControl, notify } from "./ui";
import { IconCake, IconCalendarCog, IconCalendarEvent, IconChevronLeft, IconChevronRight, IconPencil, IconPlus } from "@tabler/icons-react";
import { CalendarHostProvider, useCalendarHost, type CalendarHost } from "./host";
import { useIsCompactCalendar } from "./viewport";
import type { CalendarKey as MessageKey } from "./messages";
import type { BirthdayContact, CalEvent, CalendarInfo } from "./types";
import { useChunkedEvents } from "./chunks";
import { addDays, browserTimeZone, dayKey, monthGrid, movedStart, startOfDay, weekDays, yearDays } from "./time";
import CalendarDialog from "./CalendarDialog";
import ExternalEventDialog from "./ExternalEventDialog";
import EventDialog, { type DialogTarget } from "./EventDialog";
import JumpPicker from "./JumpPicker";
import MiniMonth from "./MiniMonth";
import MonthScroll, { scrollDays } from "./MonthScroll";
import MonthView from "./MonthView";
import WeekView from "./WeekView";
import YearView from "./YearView";
import type { DragState } from "./drag";
import { colorOf } from "./colors";
import { BIRTHDAY_COLOR, birthdayCalendar, birthdayContactId, birthdayEvents, isBirthdayEvent } from "./birthdays";
import BirthdayForm from "./BirthdayForm";

type View = "month" | "week" | "year";
const keys = (prefix: string) => ({ view: `${prefix}-cal-view`, birthdays: `${prefix}-cal-birthdays`, birthdaysColor: `${prefix}-cal-birthdays-color`, hidden: `${prefix}-cal-external-hidden` });
const readBirthdaysVisible = (k: string): boolean => { try { return localStorage.getItem(k) !== "0"; } catch { return true; } };
const readBirthdaysColor = (k: string): string => { try { const c = localStorage.getItem(k); return c && /^#[0-9a-f]{6}$/i.test(c) ? c : BIRTHDAY_COLOR; } catch { return BIRTHDAY_COLOR; } };
const readView = (k: string): View => { try { const v = localStorage.getItem(k); return v === "week" || v === "year" ? v : "month"; } catch { return "month"; } };

/** Calendriers regroupes par boite (adresse), dans l'ordre d'apparition ; l'agenda des anniversaires rejoint la boite du premier calendrier (la personnelle). */
export function groupByMailbox(list: CalendarInfo[], birthdays: CalendarInfo): { address: string; items: CalendarInfo[] }[] {
  const groups: { address: string; items: CalendarInfo[] }[] = [];
  for (const c of [...list, { ...birthdays, mailboxAddress: list[0]?.mailboxAddress }]) {
    const address = c.mailboxAddress ?? "";
    const g = groups.find((x) => x.address === address);
    if (g) g.items.push(c);
    else groups.push({ address, items: [c] });
  }
  return groups;
}

function readHiddenExternal(key: string): ReadonlySet<string> {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
    return new Set(Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(0, 200) : []);
  } catch {
    return new Set();
  }
}

/** Calendrier complet (semaine, mois, annee ; evenements, agendas, anniversaires, deplacement a la souris et au doigt). Une seule implementation pour toutes les applications Volcanium : l'hote fournit `CalendarHost`. */
export default function CalendarPage(host: CalendarHost) {
  return <CalendarHostProvider host={host}><CalendarScreen /></CalendarHostProvider>;
}

function CalendarScreen() {
  const { t, locale, api: calendarApi, storagePrefix, openContact } = useCalendarHost();
  const K = useMemo(() => keys(storagePrefix), [storagePrefix]);
  const [birthdayContacts, setBirthdayContacts] = useState<BirthdayContact[]>([]);
  const [birthdayEdit, setBirthdayEdit] = useState<BirthdayContact | null>(null);
  const [birthdaysVisible, setBirthdaysVisible] = useState(() => readBirthdaysVisible(K.birthdays));
  const [birthdaysColor, setBirthdaysColor] = useState(() => readBirthdaysColor(K.birthdaysColor));
  const [view, setView] = useState<View>(() => readView(K.view));
  const [cursor, setCursor] = useState(() => startOfDay(new Date()));
  const [calendars, setCalendars] = useState<{ state: "loading" } | { state: "none" } | { state: "error" } | { state: "ready"; list: CalendarInfo[] }>({ state: "loading" });
  const [dialog, setDialog] = useState<DialogTarget | null>(null);
  const [calDialog, setCalDialog] = useState<CalendarInfo | "new" | null>(null);
  const [epoch, setEpoch] = useState(0); // +1 = les evenements charges sont perimes (modification) : les tranches visibles sont redemandees
  const [peopleEpoch, setPeopleEpoch] = useState(0);
  const compact = useIsCompactCalendar();
  // Vue mois defilante (ecrans courts) : `nav` change a chaque navigation voulue, `ext` = mois charges de part et d'autre, `shown` = mois a l'ecran (titre).
  const [nav, setNav] = useState(0);
  const [ext, setExt] = useState({ nav: 0, before: 1, after: 3 });
  const [shown, setShown] = useState<Date | null>(null);
  const [calsOpen, setCalsOpen] = useState(false);
  const extent = ext.nav === nav ? ext : { nav, before: 1, after: 3 };
  const scrolling = compact && view === "month";
  // Agendas des comptes externes (iCloud, Yahoo) : lecture seule, charges A PART (un serveur lent ne retarde pas les agendas Volcanium) ; leur visibilite se retient dans ce navigateur.
  const [externalCals, setExternalCals] = useState<CalendarInfo[]>([]);
  const [externalFailed, setExternalFailed] = useState<string[]>([]);
  const [hiddenExternal, setHiddenExternal] = useState<ReadonlySet<string>>(() => readHiddenExternal(K.hidden));
  const [readOnlyEvent, setReadOnlyEvent] = useState<CalEvent | null>(null);
  const drag = useRef<DragState | null>(null);

  const loadCalendars = useCallback(async () => {
    const { data, error } = await calendarApi.calendars();
    if (error?.status === 404) return setCalendars({ state: "none" });
    if (error || !data) return setCalendars({ state: "error" });
    setCalendars({ state: "ready", list: data.calendars });
  }, [calendarApi]);
  useEffect(() => { void loadCalendars(); }, [loadCalendars]);
  // Une seule fois a l'ouverture, EN PARALLELE des agendas et des evenements : les agendas externes (lents) ne retardent rien.
  useEffect(() => {
    let live = true;
    void calendarApi.externalCalendars().then(({ data }) => { if (live && data) { setExternalCals(data.calendars); setExternalFailed(data.failed); } });
    return () => { live = false; };
  }, [calendarApi]);
  // Anniversaires : relus seulement quand une fiche change (le formulaire), pas a chaque modification d'evenement.
  useEffect(() => {
    let live = true;
    void calendarApi.birthdays().then(({ data }) => { if (live && data) setBirthdayContacts(data.birthdays); });
    return () => { live = false; };
  }, [calendarApi, peopleEpoch]);

  const days = useMemo(() => (scrolling ? scrollDays(cursor, extent.before, extent.after) : view === "month" ? monthGrid(cursor) : view === "week" ? weekDays(cursor) : yearDays(cursor.getFullYear())), [view, cursor, scrolling, extent.before, extent.after]);
  // Evenements : par tranches fixes en cache (voir `chunks.ts`) ; demandes des l'ouverture, sans attendre la liste des agendas.
  const mine = useChunkedEvents(days, calendarApi.events, calendars.state !== "none", epoch);
  const ext_ = useChunkedEvents(days, calendarApi.externalEvents, externalCals.length > 0, 0);
  const events = mine.events;
  const externalEvents = ext_.events;
  const eventsError = mine.error;
  const failedAccounts = useMemo(() => [...new Set([...externalFailed, ...ext_.failed])], [externalFailed, ext_.failed]);

  // Toute navigation voulue : le curseur change, la vue defilante repart de ce mois.
  const go = useCallback((d: Date) => { setCursor(d); setNav((n) => n + 1); setShown(null); }, []);
  const needBefore = useCallback(() => setExt({ ...extent, before: extent.before + 3 }), [extent]);
  const needAfter = useCallback(() => setExt({ ...extent, after: extent.after + 3 }), [extent]);
  const changeView = (v: View) => { setView(v); setNav((n) => n + 1); setShown(null); try { localStorage.setItem(K.view, v); } catch { /* stockage indisponible */ } };
  const shift = useCallback((dir: -1 | 1) => go(((c) => (view === "month" ? new Date(c.getFullYear(), c.getMonth() + dir, 1) : view === "week" ? addDays(c, 7 * dir) : new Date(c.getFullYear() + dir, 0, 1)))(cursor)), [view, cursor, go]);
  const goToday = useCallback(() => go(startOfDay(new Date())), [go]);
  const refreshEvents = () => setEpoch((n) => n + 1);
  const refresh = () => { void loadCalendars(); refreshEvents(); };

  // Raccourcis de Google Agenda : t aujourd'hui · j ou n periode suivante · k ou p precedente · w semaine · m mois · y annee · c creer un evenement
  // (pas dans un champ de saisie, pas quand une fenetre est ouverte).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (e.metaKey || e.ctrlKey || e.altKey || dialog || calDialog || readOnlyEvent || document.querySelector('[role="dialog"]') || tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (e.target as HTMLElement | null)?.isContentEditable) return;
      const key = e.key.toLowerCase();
      if (key === "t") goToday();
      else if (key === "j" || key === "n") shift(1);
      else if (key === "k" || key === "p") shift(-1);
      else if (key === "w") changeView("week");
      else if (key === "m") changeView("month");
      else if (key === "y") changeView("year");
      else if (key === "c") setDialog({ mode: "new", day: startOfDay(new Date()) });
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialog, calDialog, readOnlyEvent, goToday, shift]);

  // Calendrier « Anniversaires » : toujours present, calcule depuis les contacts, lus chez Stalwart via l'API (jamais copie en evenements), non modifiable ; seule sa visibilite se retient (ce navigateur).
  const birthdayCal = useMemo(() => birthdayCalendar(t("cal.birthdays"), birthdaysVisible, birthdaysColor), [t, birthdaysVisible, birthdaysColor]);
  const externalShown = useMemo(() => externalCals.map((c) => ({ ...c, isVisible: !hiddenExternal.has(c.id) })), [externalCals, hiddenExternal]);
  const byId = useMemo(() => new Map([...(calendars.state === "ready" ? calendars.list : []), ...externalShown, birthdayCal].map((c) => [c.id, c])), [calendars, externalShown, birthdayCal]);
  const birthdays = useMemo(() => {
    const years = [...new Set(days.map((d) => d.getFullYear()))];
    return birthdayEvents(birthdayContacts, years, (name, age) => (age === null ? t("cal.birthday.title", { name }) : t("cal.birthday.titleAge", { name, age })));
  }, [birthdayContacts, days, t]);
  const byMailbox = useMemo(() => groupByMailbox([...(calendars.state === "ready" ? calendars.list : []), ...externalShown], birthdayCal), [calendars, externalShown, birthdayCal]);
  const visible = useMemo(() => [...events, ...externalEvents, ...birthdays].filter((e) => !e.calendarId || byId.get(e.calendarId)?.isVisible !== false), [events, externalEvents, birthdays, byId]);
  const saveBirthdaysColor = (c: string) => { setBirthdaysColor(c); try { localStorage.setItem(K.birthdaysColor, c); } catch { /* stockage indisponible */ } };
  const toggleBirthdays = (on: boolean) => { setBirthdaysVisible(on); try { localStorage.setItem(K.birthdays, on ? "1" : "0"); } catch { /* stockage indisponible */ } };

  const toggle = async (c: CalendarInfo, on: boolean) => {
    if (c.readOnly) { // agenda externe : seulement retenu dans ce navigateur
      const next = new Set(hiddenExternal);
      if (on) next.delete(c.id); else next.add(c.id);
      setHiddenExternal(next);
      try { localStorage.setItem(K.hidden, JSON.stringify([...next])); } catch { /* stockage indisponible */ }
      return;
    }
    setCalendars((s) => (s.state === "ready" ? { state: "ready", list: s.list.map((x) => (x.id === c.id ? { ...x, isVisible: on } : x)) } : s));
    const { error } = await calendarApi.updateCalendar(c.id, { isVisible: on });
    if (error) void loadCalendars();
  };

  // Deplacement a la souris : affichage immediat, annule si le serveur refuse.
  const move = async (event: CalEvent, target: Date) => {
    const { start, timeZone } = movedStart(event, target, browserTimeZone());
    if (start === event.start.slice(0, 16)) return;
    const undo = mine.patch((x) => (x.id === event.id ? { ...x, start: `${start}:00`, ...(event.allDay ? {} : { timeZone }) } : x));
    const r = await calendarApi.updateEvent(event.id, { start, ...(event.allDay ? {} : { timeZone }) });
    if (r.error || !r.data) {
      undo();
      const code = r.error?.code;
      const known = code && ["domain_not_verified", "sending_paused", "recipient_suppressed", "not_organizer"].includes(code);
      return notify.error(known ? t(`cal.event.error.${code}` as MessageKey) : t("cal.move.failed"));
    }
    mine.patch((x) => (x.id === event.id ? r.data!.event : x));
    notify.success(t(event.participants.some((p) => !p.isMe) ? "cal.moved.guests" : "cal.moved"));
  };

  if (calendars.state === "loading") return <FullPageLoader />;
  if (calendars.state === "none") return <div className="mx-auto max-w-lg p-6"><Notice tone="info" title={t("cal.noCalendar.title")}>{t("cal.noCalendar.body")}</Notice></div>;
  if (calendars.state === "error") return <div className="p-6"><Notice tone="danger" action={<Button variant="secondary" onClick={() => void loadCalendars()}>{t("cal.retry")}</Button>}>{t("cal.loadError")}</Notice></div>;

  const monthTitle = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(scrolling && shown ? shown : cursor);
  const title = view === "year" ? String(cursor.getFullYear())
    : view === "month" ? monthTitle
    : (() => { const w = weekDays(cursor); const f = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }); return `${f.format(w[0]!)} – ${f.format(w[6]!)} ${w[6]!.getFullYear()}`; })();
  const highlight = new Set(view === "week" ? weekDays(cursor).map(dayKey) : []);
  const onPick = (monthStart: Date) => go(monthStart);
  const newEvent = (day: Date) => setDialog({ mode: "new", day });
  // Anniversaire d'un contact : on ouvre sa fiche ; « anniversaire seulement » (pas dans le carnet) : on le modifie ici.
  const openBirthday = (e: CalEvent) => {
    const id = birthdayContactId(e);
    const own = birthdayContacts.find((b) => b.id === id && b.standalone);
    if (own) setBirthdayEdit(own); else openContact(id);
  };
  const openEvent = (e: CalEvent) => (e.readOnly ? setReadOnlyEvent(e) : isBirthdayEvent(e) ? openBirthday(e) : setDialog({ mode: "event", event: e }));

  const calendarsSection = (
    <section aria-label={t("cal.calendars")} className="flex min-w-0 flex-col gap-1">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">{t("cal.calendars")}</h2>
        <IconButton size="sm" label={t("cal.newCalendar")} onClick={() => setCalDialog("new")}><IconPlus size={16} /></IconButton>
      </div>
      {/* Les calendriers sont regroupes par boite : on voit d'un coup d'oeil a quelle boite appartient chacun. L'agenda des anniversaires vient des contacts, ceux de la boite personnelle. */}
      {byMailbox.map((g) => (
        <div key={g.address} className="flex min-w-0 flex-col">
          {g.address && <p className="mt-1 truncate text-xs font-medium text-vc-text-secondary" title={t("cal.ofMailbox", { address: g.address })}>{g.address}</p>}
          <ul className="flex min-w-0 flex-col">
            {g.items.map((c) => (
              <li key={c.id} className="flex min-w-0 items-center gap-2 rounded py-1 hover:bg-vc-veil">
                <span aria-hidden className="size-3 shrink-0 rounded-full" style={{ backgroundColor: colorOf(c) }} />
                {c.id === birthdayCal.id
                  ? <div className="min-w-0 flex-1 overflow-hidden" title={c.name}><Checkbox checked={birthdaysVisible} onChange={toggleBirthdays} label={<span className="flex max-w-[10rem] items-center gap-1.5 truncate"><IconCake size={14} aria-hidden className="shrink-0" />{c.name}</span>} aria-label={t("cal.calendar.toggle", { name: c.name })} /></div>
                  : <div className="min-w-0 flex-1 overflow-hidden" title={c.name}><Checkbox checked={c.isVisible} onChange={(v) => void toggle(c, v)} label={<span className="block max-w-[10rem] truncate">{c.name}</span>} aria-label={t("cal.calendar.toggle", { name: c.name })} /></div>}
                {!c.readOnly && <IconButton size="sm" label={t("cal.editCalendar")} onClick={() => setCalDialog(c)}><IconPencil size={14} /></IconButton>}
              </li>
            ))}
          </ul>
        </div>
      ))}
      {failedAccounts.map((address) => <p key={address} className="mt-1 text-xs text-vc-text-secondary">{t("cal.external.failed", { address })}</p>)}
    </section>
  );

  return (
    <div className="flex h-full min-h-0 gap-4 p-4 max-sm:p-2 [@media(max-height:500px)]:p-2">
      <aside className="hidden w-64 shrink-0 flex-col gap-5 overflow-y-auto lg:flex">
        <Button icon={<IconPlus size={16} />} onClick={() => newEvent(startOfDay(new Date()))}>{t("cal.newEvent")}</Button>
        <MiniMonth cursor={cursor} highlight={highlight} onPick={(d) => { go(d); if (view === "year") changeView("week"); }} />
        {calendarsSection}
      </aside>
      <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
        <header className="flex flex-wrap items-center gap-1">
          <IconButton label={t("cal.today.title")} onClick={goToday}><IconCalendarEvent size={18} /></IconButton>
          <IconButton label={t("cal.prev")} onClick={() => shift(-1)}><IconChevronLeft size={18} /></IconButton>
          <IconButton label={t("cal.next")} onClick={() => shift(1)}><IconChevronRight size={18} /></IconButton>
          {/* Telephone et tablette : calendriers (le panneau lateral n'apparait qu'a partir de 1024 px), puis ligne 1 = fleches + « Nouvel evenement » a droite, ligne 2 = la date, ligne 3 = Semaine / Mois / Annee. */}
          <span className="lg:hidden"><IconButton label={t("cal.calendars")} onClick={() => setCalsOpen(true)}><IconCalendarCog size={18} /></IconButton></span>
          <div className="max-sm:order-2 max-sm:basis-full"><JumpPicker title={title} cursor={cursor} onPick={onPick} /></div>
          <div className="ms-auto flex items-center gap-2 max-sm:contents">
            <Button className="max-sm:order-1 max-sm:ms-auto max-sm:whitespace-nowrap max-sm:px-3! max-sm:py-1.5! lg:hidden" icon={<IconPlus size={16} />} onClick={() => newEvent(startOfDay(new Date()))}>{t("cal.newEvent")}</Button>
            <SegmentedControl<View> className="max-sm:order-3 max-sm:basis-full max-sm:[&>button]:flex-1 max-sm:[&>button]:py-1.5" label={t("cal.view")} value={view} options={[{ value: "week", label: t("cal.view.week") }, { value: "month", label: t("cal.view.month") }, { value: "year", label: t("cal.view.year") }]} onChange={changeView} />
          </div>
        </header>
        {eventsError && <Notice tone="danger" dense action={<Button variant="secondary" onClick={refreshEvents}>{t("cal.retry")}</Button>}>{t("cal.loadError")}</Notice>}
        {view === "month" && scrolling && <MonthScroll cursor={cursor} navId={nav} days={days} events={visible} calendars={byId} onDay={newEvent} onEvent={openEvent} onMore={(d) => { go(d); changeView("week"); }} onDrop={(e, d) => void move(e, d)} onVisibleMonth={setShown} onNeedBefore={needBefore} onNeedAfter={needAfter} />}
        {view === "month" && !scrolling && <MonthView cursor={cursor} events={visible} calendars={byId} drag={drag} onDay={newEvent} onEvent={openEvent} onMore={(d) => { go(d); changeView("week"); }} onDrop={(e, d) => void move(e, d)} />}
        {view === "week" && <WeekView cursor={cursor} events={visible} calendars={byId} drag={drag} onSlot={newEvent} onEvent={openEvent} onDrop={(e, d) => void move(e, d)} />}
        {view === "year" && <YearView year={cursor.getFullYear()} events={visible} onDay={(d) => { go(d); changeView("week"); }} onMonth={(m) => { go(m); changeView("month"); }} />}
      </section>
      <Modal isOpen={calsOpen} onClose={() => setCalsOpen(false)} title={t("cal.calendars")} buttons={false}>{calendarsSection}</Modal>
      {birthdayEdit && (
        <Modal isOpen onClose={() => setBirthdayEdit(null)} title={t("cal.birthday.edit")} autoClose={false} buttons={false}>
          <div className="p-1 text-start"><BirthdayForm editing={birthdayEdit} onClose={() => setBirthdayEdit(null)} onSaved={() => setPeopleEpoch((n) => n + 1)} /></div>
        </Modal>
      )}
      <ExternalEventDialog event={readOnlyEvent} calendar={readOnlyEvent?.calendarId ? byId.get(readOnlyEvent.calendarId) : undefined} onClose={() => setReadOnlyEvent(null)} />
      <EventDialog target={dialog} calendars={calendars.list} onClose={() => setDialog(null)} onChanged={refreshEvents} onBirthdaysChanged={() => setPeopleEpoch((n) => n + 1)} />
      <CalendarDialog target={calDialog} onBirthdayColor={saveBirthdaysColor} onClose={() => setCalDialog(null)} onChanged={refresh} />
    </div>
  );
}
