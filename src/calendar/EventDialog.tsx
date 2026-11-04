import { useEffect, useState } from "react";
import { Button, Checkbox, Chip, ConfirmModal, DatePicker, Input, Modal, Notice, SegmentedControl, Select, Textarea, TimePicker, notify } from "./ui";
import { useCalendarHost, useI18n } from "./host";
import type { CalendarKey as MessageKey } from "./messages";
import type { CalEvent, CalendarInfo, Status } from "./types";
import { browserTimeZone } from "./time";
import { IconVideo } from "@tabler/icons-react";
import { colorOf } from "./colors";
import BirthdayForm from "./BirthdayForm";
import GuestsField from "./GuestsField";
import { formFrom, isEmail, newForm, toInput, validate, withPendingGuest, type FormState } from "./eventForm";

/** Lien de reunion Volcanium (`/join/xxxx-xxxx-xxxx`) dans le lieu d'un evenement ; `null` sinon. Seul ce motif precis est reconnu. */
export function joinLink(location: string): string | null {
  try {
    const u = new URL(location.trim());
    return (u.protocol === "http:" || u.protocol === "https:") && /^\/join\/[a-z]{4}-[a-z]{4}-[a-z]{4}$/.test(u.pathname) ? u.toString() : null;
  } catch { return null; }
}

export type DialogTarget = { mode: "new"; day: Date } | { mode: "event"; event: CalEvent };

const STATUS_TONE: Record<Status, { icon: string; cls: string }> = {
  accepted: { icon: "✓", cls: "bg-green-500/15 text-green-700 dark:text-green-400" },
  tentative: { icon: "?", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  declined: { icon: "✕", cls: "bg-red-500/15 text-vc-danger" },
  "needs-action": { icon: "…", cls: "bg-vc-border/40 text-vc-text-secondary" },
};
const STATUS_KEY: Record<Status, MessageKey> = { accepted: "cal.status.accepted", tentative: "cal.status.tentative", declined: "cal.status.declined", "needs-action": "cal.status.needs-action" };
const zones = (current: string): string[] => {
  const all = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [];
  return [...new Set([current, browserTimeZone(), "UTC", ...all])];
};

function ReadOnly({ label, value }: { label: string; value: string }) {
  return <div className="flex flex-col gap-0.5"><span className="text-sm font-medium">{label}</span><span className="text-sm text-vc-text-secondary">{value}</span></div>;
}

/** Creation, modification et consultation d'un evenement ; reponse d'un invite. Une serie est lue et modifiee EN ENTIER (v1). */
export default function EventDialog({ target, calendars, onClose, onChanged, onBirthdaysChanged }: { target: DialogTarget | null; calendars: CalendarInfo[]; onClose: () => void; onChanged: () => void; onBirthdaysChanged: () => void }) {
  const { t, locale } = useI18n();
  const pickerLang = locale.toLowerCase().startsWith("en") ? "en" : locale.toLowerCase().startsWith("es") ? "es" : "fr";
  const { api: calendarApi, members, videoMeetings } = useCalendarHost();
  const [form, setForm] = useState<FormState | null>(null);
  const [source, setSource] = useState<CalEvent | null>(null); // evenement affiche (le maitre de la serie pour une occurrence)
  const [busy, setBusy] = useState(false);
  const [guestInput, setGuestInput] = useState("");
  const [guestError, setGuestError] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [kind, setKind] = useState<"event" | "birthday">("event");
  const [video, setVideo] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [lobby, setLobby] = useState(true);

  useEffect(() => {
    let live = true;
    setShowErrors(false); setGuestInput(""); setGuestError(false); setConfirmDelete(false); setSource(null); setKind("event"); setVideo(false); setGuestsOpen(false); setLobby(true);
    if (!target) return setForm(null);
    if (target.mode === "new") {
      const def = calendars.find((c) => c.isDefault) ?? calendars[0];
      setForm(newForm(target.day, def?.id ?? ""));
      return;
    }
    const open = (e: CalEvent) => { if (live) { setSource(e); setForm(formFrom(e)); } };
    open(target.event);
    // Organisateur avec invites : leurs reponses arrivent par courrier ; l'API les applique a la lecture, on affiche donc les statuts a jour.
    if (target.event.isOrganizer && target.event.participants.some((p) => !p.isMe)) void calendarApi.event(target.event.id).then(({ data }) => { if (data && target.event.recurrenceId === null) { if (live) setSource(data.event); } });
    // Une occurrence ne porte ni la regle ni la date de depart de la serie : on lit la serie pour la modifier sans la decaler.
    if (target.event.recurrenceId !== null) void calendarApi.series(target.event.id).then(({ data }) => { if (data) open(data.event); });
    return () => { live = false; };
  }, [target, calendars]);

  const existing = target?.mode === "event" ? (source ?? target.event) : null;
  const readOnly = !!existing && !existing.isOrganizer;
  const cal = calendars.find((c) => c.id === form?.calendarId);
  if (!target || !form) return null;
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));
  const error = validate(form);
  const fail = (code: string | undefined, prefix: "cal.event.error.") => {
    const key = `${prefix}${code ?? ""}` as MessageKey;
    notify.error(code && ["domain_not_verified", "sending_paused", "recipient_suppressed", "not_organizer"].includes(code) ? t(key) : t("cal.event.error.generic"));
  };

  const save = async () => {
    setShowErrors(true);
    if (error) return;
    // Une adresse tapee dans le champ des invites mais pas validee par « Ajouter » fait partie de l'evenement : sinon l'invitation ne partirait jamais.
    const guests = withPendingGuest(form.guests, guestInput, (e) => members.find((m) => m.email === e)?.name ?? "");
    if (!guests) return setGuestError(true);
    setGuestInput("");
    setBusy(true);
    const body = toInput({ ...form, guests });
    const r = existing ? await calendarApi.updateEvent(existing.id, body) : await calendarApi.createEvent(body, video && !form.allDay ? { lobby, allowGuests: guestsOpen } : null);
    setBusy(false);
    if (r.error) return fail(r.error.code, "cal.event.error.");
    notify.success(t(existing ? "cal.event.saved" : "cal.event.created"));
    if (r.data && r.data.unsent.length > 0) notify.error(t("cal.event.unsent", { count: r.data.unsent.length }));
    onChanged(); onClose();
  };
  const remove = async () => {
    if (!existing) return;
    setBusy(true);
    const r = await calendarApi.deleteEvent(existing.id);
    setBusy(false);
    setConfirmDelete(false);
    if (r.error) return fail(r.error.code, "cal.event.error.");
    notify.success(t("cal.event.deleted"));
    if (r.data && r.data.unsent.length > 0) notify.error(t("cal.event.unsent", { count: r.data.unsent.length }));
    onChanged(); onClose();
  };
  const respond = async (status: Exclude<Status, "needs-action">) => {
    if (!existing) return;
    setBusy(true);
    const r = await calendarApi.respond(existing.id, status);
    setBusy(false);
    if (r.error) return notify.error(t("cal.respond.failed"));
    notify.success(t("cal.respond.done"));
    onChanged(); onClose();
  };

  const me = existing?.participants.find((p) => p.isMe);
  return (
    <>
      <Modal isOpen onClose={onClose} title={existing ? existing.title || t("cal.untitled") : t("cal.newEvent")} autoClose={false} buttons={false}>
        <div className="flex flex-col gap-3 p-1 text-start">
          {!existing && <SegmentedControl<"event" | "birthday"> label={t("cal.newKind")} value={kind} options={[{ value: "event", label: t("cal.newKind.event") }, { value: "birthday", label: t("cal.newKind.birthday") }]} onChange={setKind} />}
          {!existing && kind === "birthday" ? <BirthdayForm onClose={onClose} onSaved={onBirthdaysChanged} /> : <>
          {existing?.status === "cancelled" && <Notice tone="warning" dense>{t("cal.event.cancelled")}</Notice>}
          {readOnly && <Notice tone="info" dense>{t("cal.event.notOrganizer")}</Notice>}
          {(existing?.recurrenceId !== null && existing?.recurrenceId !== undefined) || form.repeat !== "none" ? existing && <Notice tone="info" dense>{t("cal.event.series")}</Notice> : null}
          <Input label={t("cal.event.title")} value={form.title} disabled={readOnly} maxLength={200} onChange={(e) => set("title", e.target.value)} autoFocus={!existing} />
          {showErrors && error === "title" && <p role="alert" className="text-sm text-vc-danger">{t("cal.event.titleRequired")}</p>}
          {readOnly
            ? <ReadOnly label={t("cal.event.calendar")} value={cal?.name ?? ""} />
            : <div className="field-full"><Select<string> label={t("cal.event.calendar")} value={form.calendarId} options={calendars.map((c) => ({ value: c.id, label: c.mailboxAddress ? `${c.name} · ${c.mailboxAddress}` : c.name }))} onChange={(v) => set("calendarId", v)} /></div>}
          {cal && <p className="-mt-2 flex items-center gap-2 text-xs text-vc-text-secondary"><span aria-hidden className="inline-block size-3 rounded-full" style={{ backgroundColor: colorOf(cal) }} />{cal.name}</p>}
          <Checkbox checked={form.allDay} disabled={readOnly} onChange={(v) => set("allDay", v)} label={t("cal.event.allDay")} />
          <div className="grid grid-cols-2 gap-3">
            <DatePicker label={t("cal.event.startDate")} value={form.startDate} disabled={readOnly} language={pickerLang} onChange={(v) => set("startDate", v)} />
            {!form.allDay && <TimePicker label={t("cal.event.startTime")} value={form.startTime} disabled={readOnly} onChange={(v) => set("startTime", v)} />}
            <DatePicker label={t("cal.event.endDate")} value={form.endDate} disabled={readOnly} language={pickerLang} onChange={(v) => set("endDate", v)} />
            {!form.allDay && <TimePicker label={t("cal.event.endTime")} value={form.endTime} disabled={readOnly} onChange={(v) => set("endTime", v)} />}
          </div>
          {showErrors && error === "time" && <p role="alert" className="text-sm text-vc-danger">{t("cal.event.timeInvalid")}</p>}
          {!form.allDay && (readOnly
            ? <ReadOnly label={t("cal.event.timeZone")} value={form.timeZone} />
            : <div className="field-full"><Select<string> label={t("cal.event.timeZone")} value={form.timeZone} searchable options={zones(form.timeZone).map((z) => ({ value: z, label: z }))} onChange={(v) => set("timeZone", v)} /></div>)}
          {videoMeetings && !readOnly && !existing && (
            <div className="flex flex-col gap-2 rounded-lg border border-vc-line p-3">
              <Checkbox checked={video && !form.allDay} disabled={form.allDay} onChange={setVideo} label={<span className="flex items-center gap-1.5"><IconVideo size={16} aria-hidden />{t("cal.event.video")}</span>} />
              {video && !form.allDay && (
                <>
                  <p className="text-xs text-vc-text-secondary">{t("cal.event.video.help")}</p>
                  <Checkbox checked={guestsOpen} onChange={setGuestsOpen} label={t("cal.event.video.guests")} />
                  <Checkbox checked={lobby} onChange={setLobby} label={t("cal.event.video.lobby")} />
                </>
              )}
            </div>
          )}
          {existing && joinLink(existing.location) && (
            <Button variant="accent" icon={<IconVideo size={16} />} onClick={() => { window.location.assign(joinLink(existing.location)!); }}>{t("cal.event.video.join")}</Button>
          )}
          <Input label={t("cal.event.location")} value={form.location} disabled={readOnly} maxLength={300} onChange={(e) => set("location", e.target.value)} />
          <div className="field-full"><Textarea label={t("cal.event.description")} value={form.description} disabled={readOnly} maxLength={5000} rows={4} onChange={(e) => set("description", e.target.value)} /></div>
          {!readOnly && (
            <>
              <div className="field-full"><Select<FormState["repeat"]> label={t("cal.event.recurrence")} value={form.repeat} options={(["none", "daily", "weekly", "monthly", "yearly"] as const).map((v) => ({ value: v, label: t(`cal.event.rec.${v}` as MessageKey) }))} onChange={(v) => set("repeat", v)} /></div>
              {form.repeat !== "none" && (
                <div className="flex flex-col gap-3 rounded-lg border border-vc-line p-3">
                  <Input type="number" min={1} max={99} label={`${t(`cal.event.rec.${form.repeat}` as MessageKey)} ×`} value={String(form.interval)} onChange={(e) => set("interval", Math.min(99, Math.max(1, Number(e.target.value) || 1)))} />
                  <SegmentedControl<FormState["endKind"]> label={t("cal.event.rec.end")} value={form.endKind} options={(["never", "count", "date"] as const).map((v) => ({ value: v, label: t(`cal.event.rec.end${v === "never" ? "Never" : v === "count" ? "Count" : "Date"}` as MessageKey) }))} onChange={(v) => set("endKind", v)} />
                  {form.endKind === "count" && <Input type="number" min={1} max={999} label={t("cal.event.rec.count")} value={String(form.count)} onChange={(e) => set("count", Math.min(999, Math.max(1, Number(e.target.value) || 1)))} />}
                  {form.endKind === "date" && <DatePicker label={t("cal.event.rec.until")} value={form.until} language={pickerLang} onChange={(v) => set("until", v)} />}
                </div>
              )}
            </>
          )}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">{t("cal.event.guests")}</p>
            {existing && existing.participants.length > 1 && (
              <p className="text-xs text-vc-text-secondary">
                {(["accepted", "tentative", "declined", "needs-action"] as const).map((k) => [k, existing.participants.filter((p) => p.status === k).length] as const).filter(([, n]) => n > 0).map(([k, n]) => `${n} ${t(STATUS_KEY[k]).toLowerCase()}`).join(" · ")}
              </p>
            )}
            {existing && existing.participants.length > 0 && (
              <ul className="flex flex-col gap-1 text-sm">
                {existing.participants.map((p) => (
                  <li key={p.email} className="flex flex-wrap items-center justify-between gap-2">
                    <span className="min-w-0 truncate">{p.name || p.email}{p.isMe ? ` (${t("cal.event.guests.you")})` : ""}{p.isOrganizer ? ` · ${t("cal.event.guests.organizer")}` : ""}<span className="text-vc-text-secondary"> {p.name ? `<${p.email}>` : ""}</span></span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[p.status].cls}`}><span aria-hidden="true">{STATUS_TONE[p.status].icon}</span>{t(STATUS_KEY[p.status])}</span>
                  </li>
                ))}
              </ul>
            )}
            {!readOnly && (
              <>
                <GuestsField label={t("cal.event.guests.add")} guests={form.guests} onChange={(g) => set("guests", g)} members={members} draft={guestInput} onDraftChange={setGuestInput} invalid={guestError} onInvalidChange={setGuestError} />
                {guestError && <p role="alert" className="text-sm text-vc-danger">{t("cal.event.guests.invalid")}</p>}
                <p className="text-xs text-vc-text-secondary">{t("cal.event.guests.hint")}</p>
              </>
            )}
          </div>
          {existing && me && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-vc-line p-3">
              <span className="text-sm">{t(STATUS_KEY[me.status])}</span>
              <Button variant={me.status === "accepted" ? "primary" : "secondary"} loading={busy} onClick={() => void respond("accepted")}>{t("cal.respond.accept")}</Button>
              <Button variant={me.status === "tentative" ? "primary" : "secondary"} loading={busy} onClick={() => void respond("tentative")}>{t("cal.respond.tentative")}</Button>
              <Button variant={me.status === "declined" ? "primary" : "secondary"} loading={busy} onClick={() => void respond("declined")}>{t("cal.respond.decline")}</Button>
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <div>{existing && <Button variant="dangerous" disabled={busy} onClick={() => setConfirmDelete(true)}>{t("cal.event.delete")}</Button>}</div>
            <div className="flex gap-2">
              <Button variant="discret" onClick={onClose}>{readOnly ? t("cal.event.close") : t("cal.event.cancel")}</Button>
              {!readOnly && <Button variant="accent" loading={busy} onClick={() => void save()}>{existing ? t("cal.event.save") : t("cal.event.create")}</Button>}
            </div>
          </div>
          </>}
        </div>
      </Modal>
      <ConfirmModal isOpen={confirmDelete} onClose={() => setConfirmDelete(false)} title={existing?.isOrganizer && existing.participants.some((p) => !p.isMe) ? t("cal.event.confirmDelete") : t("cal.event.confirmDeleteAttendee")} confirmLabel={t("cal.event.delete")} cancelLabel={t("cal.event.cancel")} onConfirm={() => void remove()} />
    </>
  );
}
