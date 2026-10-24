import { useMemo, useState } from "react";
import { Button, ConfirmModal, Input, Select, notify } from "./ui";
import { useCalendarHost } from "./host";
import { birthdayFromFields } from "./birthdays";
import type { BirthdayContact } from "./types";

const NEW = "";


/**
 * Ajout d'un anniversaire depuis le calendrier. Un anniversaire vit sur un contact (source unique, cf. lib/birthdays.ts) : on le rattache a un contact
 * existant, ou on cree une fiche « anniversaire seulement » (absente du carnet d'adresses) a partir du nom saisi. Le calendrier « Anniversaires » le montre ensuite.
 * Avec `editing` : modification (nom, date) ou suppression d'une telle fiche.
 */
export default function BirthdayForm({ onClose, onSaved, editing }: { onClose: () => void; onSaved: () => void; editing?: BirthdayContact }) {
  const { t, locale, people } = useCalendarHost();
  const { contacts } = people;
  const [contactId, setContactId] = useState(NEW);
  const [name, setName] = useState(editing?.name ?? "");
  const [day, setDay] = useState(editing ? String(editing.birthday.day) : "");
  const [month, setMonth] = useState<number | undefined>(editing?.birthday.month);
  const [year, setYear] = useState(editing?.birthday.year ? String(editing.birthday.year) : "");
  const [confirm, setConfirm] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [busy, setBusy] = useState(false);

  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: new Intl.DateTimeFormat(locale, { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2000, i, 1))) })), [locale]);
  const options = useMemo(() => [{ value: NEW, label: t("cal.birthday.noContact") }, ...[...contacts].sort((a, b) => a.name.localeCompare(b.name, locale)).map((c) => ({ value: c.id, label: c.name }))], [contacts, locale, t]);
  const linked = editing ? undefined : contacts.find((c) => c.id === contactId);

  const link = (id: string) => {
    setContactId(id);
    const c = contacts.find((x) => x.id === id);
    if (!c) return;
    setName(c.name);
    if (c.birthday) { setDay(String(c.birthday.day)); setMonth(c.birthday.month); setYear(c.birthday.year ? String(c.birthday.year) : ""); }
  };

  const birthday = birthdayFromFields({ day, month: month === undefined ? "" : String(month), year });
  const nameMissing = !linked && !name.trim();
  const invalid = birthday === null || birthday === "invalid";

  const save = async () => {
    setShowErrors(true);
    if (nameMissing || invalid) return;
    setBusy(true);
    const ok = await people.save({ editingId: editing?.id, contactId: linked?.id, name: name.trim(), birthday });
    setBusy(false);
    if (!ok) return notify.error(t("cal.birthday.error"));
    notify.success(t(editing ? "cal.birthday.updated" : "cal.birthday.saved"));
    onSaved(); onClose();
  };

  const remove = async () => {
    if (!editing) return;
    setBusy(true);
    const ok = await people.remove(editing.id);
    setBusy(false);
    setConfirm(false);
    if (!ok) return notify.error(t("cal.birthday.error"));
    notify.success(t("cal.birthday.deleted"));
    onSaved(); onClose();
  };

  return (
    <div className="flex flex-col gap-3">
      {!editing && <div className="field-full"><Select<string> label={t("cal.birthday.contact")} value={contactId} searchable options={options} onChange={link} /></div>}
      <Input label={t("cal.birthday.name")} value={name} disabled={!!linked} maxLength={200} autoFocus onChange={(e) => setName(e.target.value)} />
      {showErrors && nameMissing && <p role="alert" className="text-sm text-vc-danger">{t("cal.birthday.nameRequired")}</p>}
      <fieldset>
        <legend className="mb-1 text-sm font-medium">{t("cal.birthday.date")}</legend>
        <div className="flex flex-wrap items-start gap-2">
          <Input type="number" inputMode="numeric" min={1} max={31} className="w-20" aria-label={t("cal.birthday.field.day")} placeholder={t("cal.birthday.field.day")} value={day} onChange={(e) => setDay(e.target.value)} />
          <Select<number> className="min-w-0! flex-1 capitalize max-sm:min-w-[7rem]!" value={month} placeholder={t("cal.birthday.field.month")} options={months} onChange={setMonth} />
          <Input type="number" inputMode="numeric" min={1900} max={2100} className="w-44 max-sm:w-28" aria-label={t("cal.birthday.field.year")} placeholder={t("cal.birthday.field.year")} value={year} onChange={(e) => setYear(e.target.value)} />
        </div>
      </fieldset>
      {showErrors && invalid && <p role="alert" className="text-sm text-vc-danger">{t("cal.birthday.field.invalid")}</p>}
      {!editing && <p className="text-xs text-vc-text-secondary">{t(linked ? "cal.birthday.hintLinked" : "cal.birthday.hintNew")}</p>}
      <div className="flex items-center justify-between gap-2 pt-2">
        <div>{editing && <Button type="button" variant="dangerous" disabled={busy} onClick={() => setConfirm(true)}>{t("cal.event.delete")}</Button>}</div>
        <div className="flex gap-2">
          <Button variant="discret" onClick={onClose}>{t("cal.event.cancel")}</Button>
          <Button variant="accent" loading={busy} onClick={() => void save()}>{t(editing ? "cal.event.save" : "cal.event.create")}</Button>
        </div>
      </div>
      <ConfirmModal isOpen={confirm} onClose={() => setConfirm(false)} title={t("cal.birthday.confirmDelete", { name: editing?.name ?? "" })} confirmLabel={t("cal.event.delete")} cancelLabel={t("cal.event.cancel")} onConfirm={() => void remove()} />
    </div>
  );
}
