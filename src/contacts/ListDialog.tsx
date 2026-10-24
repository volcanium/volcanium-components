import { useMemo, useState } from "react";
import { Button, Input, Modal, Notice, Textarea, notify } from "./ui";
import { useContactsHost } from "./host";
import { parseRecipients } from "./recipients";
import { MAX_CONTACTS, MAX_LIST_ADDRESSES, type ContactList } from "./api";

interface Props {
  /** `null` = nouvelle liste. */
  initial: ContactList | null;
  onClose: () => void;
  onSaved: (list: ContactList) => void;
}

/** Liste de diffusion : un nom et des ADRESSES (pas de noms necessaires), une par ligne ou separees par des virgules. */
export default function ListDialog({ initial, onClose, onSaved }: Props) {
  const { t, api: contactsApi } = useContactsHost();
  const [name, setName] = useState(initial?.name ?? "");
  const [text, setText] = useState(initial?.addresses.join("\n") ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const parsed = useMemo(() => {
    const { valid, invalid } = parseRecipients(text.replace(/\n+/g, ","));
    return { addresses: [...new Set(valid.map((r) => r.email.toLowerCase()))], invalid };
  }, [text]);

  const submit = async () => {
    if (parsed.invalid.length > 0) return setError(t("contacts.list.invalid", { value: parsed.invalid[0]! }));
    if (parsed.addresses.length === 0) return setError(t("contacts.list.empty"));
    if (parsed.addresses.length > MAX_LIST_ADDRESSES) return setError(t("contacts.list.tooMany"));
    if (!name.trim()) return setError(t("contacts.error.name"));
    setSaving(true);
    const input = { name: name.trim(), addresses: parsed.addresses };
    const { data, error: err } = initial ? await contactsApi.updateList(initial.id, input) : await contactsApi.createList(input);
    setSaving(false);
    if (err || !data) return setError(err?.code === "contact_limit" ? t("contacts.error.limit", { max: MAX_CONTACTS }) : t("contacts.error.generic"));
    notify.success(t("contacts.list.saved"));
    onSaved(data.list);
  };

  return (
    <Modal isOpen onClose={onClose} autoClose={false} title={t(initial ? "contacts.list.dialog.edit" : "contacts.list.dialog.new")} buttons={false} className="w-full">
      <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
        <Input label={t("contacts.list.name")} value={name} maxLength={200} autoFocus onChange={(e) => setName(e.target.value)} />
        <div className="field-full"><Textarea label={t("contacts.list.addresses")} value={text} rows={8} spellCheck={false} onChange={(e) => { setText(e.target.value); setError(null); }} /></div>
        <p className="-mt-1 text-xs text-vc-text-secondary">{t("contacts.list.hint")}</p>
        <p className="text-sm" aria-live="polite">{t("contacts.list.count", { count: parsed.addresses.length })}{parsed.invalid.length > 0 && <span className="ml-2 text-vc-danger">{t("contacts.list.invalid", { value: parsed.invalid[0]! })}</span>}</p>
        {error && <Notice tone="danger">{error}</Notice>}
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>{t("contacts.cancel")}</Button>
          <Button type="submit" loading={saving}>{t("contacts.save")}</Button>
        </div>
      </form>
    </Modal>
  );
}
