import { useRef, useState } from "react";
import { Button, Modal, notify } from "./ui";
import { IconDownload, IconUpload } from "@tabler/icons-react";
import { useContactsHost } from "./host";
import { MAX_IMPORT_CHARS, MAX_IMPORT_ENTRIES } from "./api";

interface Props { onClose: () => void; /** Apres un import : recharger les contacts. */ onImported: () => void }

/** Importer (vCard ou CSV) et exporter (vCard ou CSV) tous les contacts et listes. */
export default function ImportExportDialog({ onClose, onImported }: Props) {
  const { t, api: contactsApi } = useContactsHost();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const importFile = async (file: File | undefined) => {
    if (!file) return;
    // Le format vient de l'extension choisie par l'utilisateur, jamais du contenu.
    const format = /\.(vcf|vcard)$/i.test(file.name) ? "vcf" : /\.csv$/i.test(file.name) ? "csv" : null;
    if (!format) return notify.error(t("contacts.io.failed"));
    if (file.size > MAX_IMPORT_CHARS) return notify.error(t("contacts.io.tooBig"));
    setBusy(true);
    const { data, error } = await contactsApi.import(format, await file.text());
    setBusy(false);
    if (input.current) input.current.value = "";
    if (error || !data) return notify.error(error?.status === 413 ? t("contacts.io.tooBig") : t("contacts.io.failed"));
    notify.success(t("contacts.io.done", { created: data.created, skipped: data.skipped, invalid: data.invalid }));
    if (data.truncated) notify.warn(t("contacts.io.truncated", { max: MAX_IMPORT_ENTRIES }));
    if (data.limited > 0) notify.warn(t("contacts.io.limited", { count: data.limited }));
    onImported();
    onClose();
  };

  const exportFile = async (format: "vcf" | "csv") => {
    setBusy(true);
    const blob = await contactsApi.export(format);
    setBusy(false);
    if (!blob) return notify.error(t("contacts.io.exportFailed"));
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contacts.${format}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <Modal isOpen onClose={onClose} title={t("contacts.io.title")} buttons={false} className="w-full">
      <div className="flex flex-col gap-5">
        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">{t("contacts.io.import")}</h3>
          <p className="text-sm text-vc-text-secondary">{t("contacts.io.importHint")}</p>
          <input ref={input} type="file" accept=".vcf,.vcard,.csv,text/vcard,text/csv" hidden onChange={(e) => void importFile(e.target.files?.[0])} />
          <div><Button variant="secondary" icon={<IconUpload size={16} />} loading={busy} onClick={() => input.current?.click()}>{t("contacts.io.choose")}</Button></div>
        </section>
        <div className="h-px bg-vc-line" />
        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">{t("contacts.io.export")}</h3>
          <p className="text-sm text-vc-text-secondary">{t("contacts.io.exportHint")}</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" icon={<IconDownload size={16} />} disabled={busy} onClick={() => void exportFile("vcf")}>{t("contacts.io.vcf")}</Button>
            <Button variant="secondary" icon={<IconDownload size={16} />} disabled={busy} onClick={() => void exportFile("csv")}>{t("contacts.io.csv")}</Button>
          </div>
        </section>
      </div>
    </Modal>
  );
}
