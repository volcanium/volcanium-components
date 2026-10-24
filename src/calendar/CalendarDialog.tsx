import { useEffect, useState } from "react";
import { Button, ConfirmModal, Input, Modal, notify } from "./ui";
import { useCalendarApi, useI18n } from "./host";
import type { CalendarInfo } from "./types";
import { BIRTHDAY_CALENDAR_ID } from "./birthdays";
import { DEFAULT_COLOR, PALETTE } from "./colors";

/** Creation et modification d'un calendrier (nom, couleur) ; suppression avec confirmation (pas le calendrier par defaut). */
export default function CalendarDialog({ target, onClose, onChanged, onBirthdayColor }: { target: CalendarInfo | "new" | null; onClose: () => void; onChanged: () => void; onBirthdayColor: (color: string) => void }) {
  const { t } = useI18n();
  const calendarApi = useCalendarApi();
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(DEFAULT_COLOR);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const editing = target !== null && target !== "new" ? target : null;
  // « Anniversaires » est calcule par le panel (pas dans Stalwart) : seule sa couleur change, et elle se retient dans ce navigateur.
  const local = editing?.id === BIRTHDAY_CALENDAR_ID;

  useEffect(() => {
    setConfirm(false);
    if (target === "new") { setName(""); setColor(PALETTE[Math.floor(Math.random() * PALETTE.length)]!); }
    else if (target) { setName(target.name); setColor(target.color ?? DEFAULT_COLOR); }
  }, [target]);
  if (!target) return null;

  const save = async () => {
    if (!name.trim()) return;
    if (local) { onBirthdayColor(color); notify.success(t("cal.calendar.saved")); return onClose(); }
    setBusy(true);
    const r = editing ? await calendarApi.updateCalendar(editing.id, { name: name.trim(), color }) : await calendarApi.createCalendar(name.trim(), color);
    setBusy(false);
    if (r.error || !r.data) return notify.error(t("cal.calendar.error.generic"));
    notify.success(editing ? t("cal.calendar.saved") : t("cal.calendar.created", { name: r.data.calendar.name }));
    onChanged(); onClose();
  };
  const remove = async () => {
    if (!editing) return;
    setBusy(true);
    const r = await calendarApi.deleteCalendar(editing.id);
    setBusy(false); setConfirm(false);
    if (r.error) return notify.error(r.error.code === "default_calendar" ? t("cal.calendar.error.default_calendar") : t("cal.calendar.error.generic"));
    notify.success(t("cal.calendar.deleted"));
    onChanged(); onClose();
  };

  return (
    <>
      <Modal isOpen onClose={onClose} title={editing ? t("cal.editCalendar") : t("cal.newCalendar")} autoClose={false} buttons={false}>
        <form className="flex flex-col gap-4 p-1 text-start" onSubmit={(e) => { e.preventDefault(); void save(); }}>
          <Input label={t("cal.calendar.name")} value={name} maxLength={100} disabled={local} autoFocus={!local} onChange={(e) => setName(e.target.value)} />
          <div role="radiogroup" aria-label={t("cal.calendar.color")} className="flex flex-wrap gap-2">
            {PALETTE.map((c) => (
              <button key={c} type="button" role="radio" aria-checked={color === c} aria-label={c} onClick={() => setColor(c)} className={`size-8 rounded-full border-2 ${color === c ? "border-vc-text" : "border-transparent"}`} style={{ backgroundColor: c }} />
            ))}
            <label className="flex items-center gap-2 text-sm text-vc-text-secondary">
              <input type="color" value={/^#[0-9a-f]{6}$/i.test(color) ? color : DEFAULT_COLOR} onChange={(e) => setColor(e.target.value)} aria-label={t("cal.calendar.color")} className="size-8 cursor-pointer rounded border border-vc-line bg-transparent p-0" />
            </label>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div>{editing && !editing.isDefault && !local && <Button type="button" variant="dangerous" disabled={busy} onClick={() => setConfirm(true)}>{t("cal.deleteCalendar")}</Button>}</div>
            <div className="flex gap-2">
              <Button type="button" variant="discret" onClick={onClose}>{t("cal.event.cancel")}</Button>
              <Button type="submit" variant="accent" loading={busy} disabled={!name.trim()}>{editing ? t("cal.event.save") : t("cal.event.create")}</Button>
            </div>
          </div>
        </form>
      </Modal>
      <ConfirmModal isOpen={confirm} onClose={() => setConfirm(false)} title={t("cal.calendar.confirmDelete", { name: editing?.name ?? "" })} confirmLabel={t("cal.event.delete")} cancelLabel={t("cal.event.cancel")} onConfirm={() => void remove()} />
    </>
  );
}
