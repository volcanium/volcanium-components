import { useEffect, useState } from "react";
import { Button, Input, Modal, Notice, Select, Textarea, notify } from "./ui";
import { IconPlus, IconX } from "@tabler/icons-react";
import { useContactsHost } from "./host";
import type { ContactsKey as MessageKey } from "./messages";
import { isValidEmail } from "./recipients";
import { photoFromFile } from "./photo";
import { birthdayFromFields } from "../calendar/birthdays";
import { MAX_CONTACTS, type Contact, type ContactInput, type EmailLabel, type PhoneLabel } from "./api";
import { useContacts } from "./ContactsContext";
import { splitName } from "./name";
import PhotoPicker from "./PhotoPicker";

const PHONE = /^[0-9+().\-\s#*]{1,40}$/;
const EMAIL_LABELS: EmailLabel[] = ["work", "home", "other"];
const PHONE_LABELS: PhoneLabel[] = ["work", "home", "mobile", "other"];
const EMPTY_ADDRESS: ContactInput["addresses"][number] = { street: "", postalCode: "", city: "", country: "", label: "home" };

interface Props {
  /** `null` = nouveau contact. */
  initial: Contact | null;
  /** Collegue de l'organisation : son nom et son adresse viennent de l'annuaire de l'entreprise et ne se modifient pas ici. `initial: null` = la fiche est creee a partir de l'annuaire. */
  colleague?: { name: string; email: string };
  onClose: () => void;
  onSaved: (contact: Contact) => void;
}

/** Formulaire d'un contact (creation et modification). */
export default function ContactDialog({ initial, colleague, onClose, onSaved }: Props) {
  const { t, locale, api: contactsApi, useColleaguePhoto } = useContactsHost();
  const { photosAvailable, contacts } = useContacts();
  const fromDirectory = colleague ? splitName(colleague.name, colleague.email) : null;
  const directoryPhoto = useColleaguePhoto(colleague?.email);
  const lockedEmail = colleague?.email.toLowerCase() ?? null;
  const [firstName, setFirstName] = useState(initial?.firstName ?? fromDirectory?.firstName ?? "");
  const [lastName, setLastName] = useState(initial?.lastName ?? fromDirectory?.lastName ?? "");
  const [company, setCompany] = useState(initial?.company ?? "");
  const [jobTitle, setJobTitle] = useState(initial?.jobTitle ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [emails, setEmails] = useState<ContactInput["emails"]>(initial?.emails.length ? initial.emails : [{ address: lockedEmail ?? "", label: "work" }]);
  const [phones, setPhones] = useState<ContactInput["phones"]>(initial?.phones ?? []);
  const [addresses, setAddresses] = useState<ContactInput["addresses"]>(initial?.addresses ?? []);
  const [bDay, setBDay] = useState(initial?.birthday ? String(initial.birthday.day) : "");
  const [bMonth, setBMonth] = useState<number | undefined>(initial?.birthday?.month);
  const [bYear, setBYear] = useState(initial?.birthday?.year ? String(initial.birthday.year) : "");
  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: new Intl.DateTimeFormat(locale, { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2000, i, 1))) }));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // Photo : `url` = ce qui s'affiche ; `dataUrl` = nouvelle photo a envoyer ; `removed` = a retirer.
  const [photo, setPhoto] = useState<{ url: string | null; dataUrl: string | null; removed: boolean }>({ url: null, dataUrl: null, removed: false });
  useEffect(() => {
    let live = true;
    if (initial?.hasPhoto) void contactsApi.loadPhoto(initial.id).then((url) => live && setPhoto((p) => (p.dataUrl || p.removed ? p : { ...p, url })));
    return () => { live = false; };
  }, [initial]);
  const pickPhoto = async (file: File) => {
    const dataUrl = await photoFromFile(file);
    if (!dataUrl) return setError(t("contacts.photo.invalid"));
    setError(null);
    setPhoto({ url: dataUrl, dataUrl, removed: false });
  };

  const submit = async () => {
    const filledEmails = emails.map((e) => ({ address: e.address.trim().toLowerCase(), label: e.label })).filter((e) => e.address);
    const filledPhones = phones.map((p) => ({ number: p.number.trim(), label: p.label })).filter((p) => p.number);
    const badEmail = filledEmails.find((e) => !isValidEmail(e.address));
    if (badEmail) return setError(t("contacts.error.email", { value: badEmail.address }));
    const badPhone = filledPhones.find((p) => !PHONE.test(p.number));
    if (badPhone) return setError(t("contacts.error.phone", { value: badPhone.number }));
    // Pas de doublon : une adresse deja portee par une AUTRE fiche. La fusion des fiches existantes se fait dans « Doublons ».
    for (const e of filledEmails.filter((x) => !initial?.emails.some((o) => o.address === x.address))) { // seules les adresses AJOUTEES comptent : une fiche deja en doublon reste modifiable
      const clash = contacts.find((c) => c.id !== initial?.id && c.emails.some((x) => x.address.trim().toLowerCase() === e.address));
      if (clash) return setError(t("contacts.error.duplicate", { value: e.address, name: clash.name }));
    }
    if (!firstName.trim() && !lastName.trim() && !company.trim() && filledEmails.length === 0) return setError(t("contacts.error.name"));
    const birthday = birthdayFromFields({ day: bDay, month: bMonth === undefined ? "" : String(bMonth), year: bYear });
    if (birthday === "invalid") return setError(t("contacts.error.birthday"));
    const filledAddresses = addresses.map((a) => ({ ...a, street: a.street.trim(), postalCode: a.postalCode.trim(), city: a.city.trim(), country: a.country.trim() })).filter((a) => a.street || a.postalCode || a.city || a.country);
    if (lockedEmail && !filledEmails.some((e) => e.address === lockedEmail)) return setError(t("contacts.error.generic"));
    const input: ContactInput = { firstName: firstName.trim(), lastName: lastName.trim(), company: company.trim(), jobTitle: jobTitle.trim(), notes: notes.trim(), emails: [...new Map(filledEmails.map((e) => [e.address, e])).values()], phones: filledPhones, addresses: filledAddresses, birthday };
    setSaving(true);
    const { data, error: err } = initial ? await contactsApi.update(initial.id, input) : await contactsApi.create(input);
    setSaving(false);
    if (err || !data) return setError(err?.code === "contact_limit" ? t("contacts.error.limit", { max: MAX_CONTACTS }) : t("contacts.error.generic"));
    // La photo suit l'enregistrement de la fiche (endpoint a part) ; un echec de photo ne fait pas perdre la fiche.
    let contact = data.contact;
    if (photo.dataUrl || (photo.removed && initial?.hasPhoto)) {
      const r = photo.dataUrl ? await contactsApi.setPhoto(contact.id, photo.dataUrl) : await contactsApi.removePhoto(contact.id);
      if (r.error) notify.error(t("contacts.photo.failed")); else contact = { ...contact, hasPhoto: photo.dataUrl !== null };
    }
    notify.success(t("contacts.saved"));
    onSaved(contact);
  };

  return (
    <Modal isOpen onClose={onClose} autoClose={false} title={t(initial || colleague ? "contacts.dialog.edit" : "contacts.dialog.new")} buttons={false} className="w-full">
      <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
        <div className="flex items-start gap-4 max-sm:flex-col">
          <PhotoPicker url={photo.url ?? (colleague && !photo.removed ? directoryPhoto : null)} disabled={!photosAvailable || !!colleague} onFile={(f) => void pickPhoto(f)} onRemove={() => setPhoto({ url: null, dataUrl: null, removed: true })} />
          <div className="grid min-w-0 flex-1 grid-cols-2 gap-3 max-sm:w-full max-sm:grid-cols-1">
            <Input label={t("contacts.field.firstName")} value={firstName} maxLength={100} disabled={!!colleague} {...(colleague ? {} : { autoFocus: true })} onChange={(e) => setFirstName(e.target.value)} />
            <Input label={t("contacts.field.lastName")} value={lastName} maxLength={100} disabled={!!colleague} onChange={(e) => setLastName(e.target.value)} />
            <Input label={t("contacts.field.company")} value={company} maxLength={200} onChange={(e) => setCompany(e.target.value)} />
            <Input label={t("contacts.field.jobTitle")} value={jobTitle} maxLength={200} onChange={(e) => setJobTitle(e.target.value)} />
          </div>
        </div>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium">{t("contacts.field.emails")}</legend>
          {emails.map((e, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="min-w-0 flex-1"><Input type="email" aria-label={t("contacts.field.email")} placeholder={t("contacts.field.email")} value={e.address} maxLength={320} disabled={e.address.trim().toLowerCase() === lockedEmail} onChange={(ev) => setEmails((prev) => prev.map((x, j) => (j === i ? { ...x, address: ev.target.value } : x)))} /></div>
              <Select<EmailLabel> className="w-32! min-w-0! max-sm:w-28!" value={e.label} options={EMAIL_LABELS.map((l) => ({ value: l, label: t(`contacts.label.${l}` as MessageKey) }))} onChange={(v) => setEmails((prev) => prev.map((x, j) => (j === i ? { ...x, label: v } : x)))} />
              {e.address.trim().toLowerCase() === lockedEmail ? <span aria-hidden className="size-8 shrink-0" /> : <button type="button" aria-label={t("contacts.remove")} title={t("contacts.remove")} onClick={() => setEmails((prev) => prev.filter((_, j) => j !== i))} className="mt-1.5 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-vc-secondary/60 hover:bg-vc-veil hover:text-vc-secondary"><IconX size={16} aria-hidden /></button>}
            </div>
          ))}
          {emails.length < 10 && <div><Button type="button" variant="secondary" icon={<IconPlus size={16} />} onClick={() => setEmails((prev) => [...prev, { address: "", label: "work" }])}>{t("contacts.addEmail")}</Button></div>}
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium">{t("contacts.field.phones")}</legend>
          {phones.map((p, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="min-w-0 flex-1"><Input type="tel" aria-label={t("contacts.field.phone")} placeholder={t("contacts.field.phone")} value={p.number} maxLength={40} onChange={(ev) => setPhones((prev) => prev.map((x, j) => (j === i ? { ...x, number: ev.target.value } : x)))} /></div>
              <Select<PhoneLabel> className="w-32! min-w-0! max-sm:w-28!" value={p.label} options={PHONE_LABELS.map((l) => ({ value: l, label: t(`contacts.label.${l}` as MessageKey) }))} onChange={(v) => setPhones((prev) => prev.map((x, j) => (j === i ? { ...x, label: v } : x)))} />
              <button type="button" aria-label={t("contacts.remove")} title={t("contacts.remove")} onClick={() => setPhones((prev) => prev.filter((_, j) => j !== i))} className="mt-1.5 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-vc-secondary/60 hover:bg-vc-veil hover:text-vc-secondary"><IconX size={16} aria-hidden /></button>
            </div>
          ))}
          {phones.length < 10 && <div><Button type="button" variant="secondary" icon={<IconPlus size={16} />} onClick={() => setPhones((prev) => [...prev, { number: "", label: "mobile" }])}>{t("contacts.addPhone")}</Button></div>}
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-sm font-medium">{t("contacts.field.addresses")}</legend>
          {addresses.map((a, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-lg border border-vc-line p-3">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1"><Input aria-label={t("contacts.field.street")} placeholder={t("contacts.field.street")} value={a.street} maxLength={200} onChange={(ev) => setAddresses((prev) => prev.map((x, j) => (j === i ? { ...x, street: ev.target.value } : x)))} /></div>
                <Select<EmailLabel> className="w-32! min-w-0! max-sm:w-28!" value={a.label} options={EMAIL_LABELS.map((l) => ({ value: l, label: t(`contacts.label.${l}` as MessageKey) }))} onChange={(v) => setAddresses((prev) => prev.map((x, j) => (j === i ? { ...x, label: v } : x)))} />
                <button type="button" aria-label={t("contacts.remove")} title={t("contacts.remove")} onClick={() => setAddresses((prev) => prev.filter((_, j) => j !== i))} className="mt-1.5 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-vc-secondary/60 hover:bg-vc-veil hover:text-vc-secondary"><IconX size={16} aria-hidden /></button>
              </div>
              <div className="grid grid-cols-[7rem_1fr_1fr] gap-2 max-sm:grid-cols-1">
                <Input aria-label={t("contacts.field.postalCode")} placeholder={t("contacts.field.postalCode")} value={a.postalCode} maxLength={20} onChange={(ev) => setAddresses((prev) => prev.map((x, j) => (j === i ? { ...x, postalCode: ev.target.value } : x)))} />
                <Input aria-label={t("contacts.field.city")} placeholder={t("contacts.field.city")} value={a.city} maxLength={100} onChange={(ev) => setAddresses((prev) => prev.map((x, j) => (j === i ? { ...x, city: ev.target.value } : x)))} />
                <Input aria-label={t("contacts.field.country")} placeholder={t("contacts.field.country")} value={a.country} maxLength={100} onChange={(ev) => setAddresses((prev) => prev.map((x, j) => (j === i ? { ...x, country: ev.target.value } : x)))} />
              </div>
            </div>
          ))}
          {addresses.length < 3 && <div><Button type="button" variant="secondary" icon={<IconPlus size={16} />} onClick={() => setAddresses((prev) => [...prev, { ...EMPTY_ADDRESS }])}>{t("contacts.addAddress")}</Button></div>}
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium">{t("contacts.field.birthday")}</legend>
          <div className="flex flex-wrap items-start gap-2">
            <Input type="number" inputMode="numeric" min={1} max={31} className="w-20" aria-label={t("contacts.birthday.day")} placeholder={t("contacts.birthday.day")} value={bDay} onChange={(e) => setBDay(e.target.value)} />
            <Select<number> className="min-w-0! flex-1 capitalize max-sm:min-w-[7rem]!" value={bMonth} placeholder={t("contacts.birthday.month")} options={months} onChange={setBMonth} />
            <Input type="number" inputMode="numeric" min={1900} max={2100} className="w-44 max-sm:w-28" aria-label={t("contacts.birthday.year")} placeholder={t("contacts.birthday.year")} value={bYear} onChange={(e) => setBYear(e.target.value)} />
            {(bDay || bMonth !== undefined || bYear) && <button type="button" aria-label={t("contacts.remove")} title={t("contacts.remove")} onClick={() => { setBDay(""); setBMonth(undefined); setBYear(""); }} className="mt-1.5 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-vc-secondary/60 hover:bg-vc-veil hover:text-vc-secondary"><IconX size={16} aria-hidden /></button>}
          </div>
        </fieldset>

        <div className="field-full"><Textarea label={t("contacts.field.notes")} value={notes} maxLength={5000} rows={3} onChange={(e) => setNotes(e.target.value)} /></div>

        {colleague && <Notice tone="info" dense>{t("contacts.colleague.locked")}</Notice>}
        {error && <Notice tone="danger">{error}</Notice>}
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>{t("contacts.cancel")}</Button>
          <Button type="submit" loading={saving}>{t("contacts.save")}</Button>
        </div>
      </form>
    </Modal>
  );
}
