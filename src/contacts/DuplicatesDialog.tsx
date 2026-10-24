import { useMemo, useState } from "react";
import { Button, ConfirmModal, Modal, Tag, notify } from "./ui";
import { useContactsHost } from "./host";
import { findDuplicates, mergeContacts, pickPrimary, type DuplicateGroup } from "./duplicates";
import { type Contact } from "./api";
import ContactAvatar from "./ContactAvatar";

interface Props {
  contacts: Contact[];
  /** Fiche d'un collegue de l'annuaire : conservee de preference (son nom vient de l'annuaire). */
  isColleague: (c: Contact) => boolean;
  onClose: () => void;
  /** Recharge les contacts apres une fusion. */
  onMerged: () => Promise<void>;
}

/** Doublons : les fiches qui partagent une adresse (certain) ou le meme nom (possible), fusionnees en une seule au choix de l'utilisateur. */
export default function DuplicatesDialog({ contacts, isColleague, onClose, onMerged }: Props) {
  const { t, api: contactsApi } = useContactsHost();
  const groups = useMemo(() => findDuplicates(contacts), [contacts]);
  const byId = useMemo(() => new Map(contacts.map((c) => [c.id, c])), [contacts]);
  const [confirm, setConfirm] = useState<DuplicateGroup | "all" | null>(null);
  const [busy, setBusy] = useState(false);
  const sure = groups.filter((g) => g.reason === "email");

  /** Fusionne un groupe : la fiche conservee est mise a jour d'abord, les autres ne sont supprimees qu'ensuite (un echec ne perd rien). */
  const mergeGroup = async (g: DuplicateGroup): Promise<number> => {
    const members = g.ids.flatMap((id) => (byId.has(id) ? [byId.get(id)!] : []));
    if (members.length < 2) return 0;
    const primary = pickPrimary(members, isColleague);
    const others = members.filter((m) => m.id !== primary.id);
    const updated = await contactsApi.update(primary.id, mergeContacts(primary, others));
    if (updated.error) return 0;
    if (!primary.favorite && others.some((o) => o.favorite)) await contactsApi.bulk("favorite", [primary.id]);
    const removed = await contactsApi.bulk("delete", others.map((o) => o.id));
    return removed.data?.done ?? 0;
  };

  const run = async () => {
    const todo = confirm === "all" ? sure : confirm ? [confirm] : [];
    setConfirm(null);
    if (todo.length === 0 || busy) return;
    setBusy(true);
    let merged = 0, failed = 0;
    for (const g of todo) { const n = await mergeGroup(g); if (n > 0) merged += n; else failed++; }
    await onMerged();
    setBusy(false);
    if (failed > 0) notify.error(t("contacts.duplicates.failed"));
    if (merged > 0) notify.success(t("contacts.duplicates.merged", { count: merged }));
  };

  const confirmGroup = confirm && confirm !== "all" ? confirm : null;
  const keep = confirmGroup ? pickPrimary(confirmGroup.ids.flatMap((id) => (byId.has(id) ? [byId.get(id)!] : [])), isColleague) : null;

  return (
    <Modal isOpen onClose={onClose} title={t("contacts.duplicates.title")} autoClose={false} buttons={false} className="w-full">
      <div className="flex flex-col gap-4">
        {groups.length === 0 ? (
          <p className="text-sm text-vc-text-secondary">{t("contacts.duplicates.none")}</p>
        ) : (
          <>
            <p className="text-sm text-vc-text-secondary">{t("contacts.duplicates.intro")}</p>
            {sure.length > 1 && <div><Button type="button" variant="secondary" disabled={busy} onClick={() => setConfirm("all")}>{t("contacts.duplicates.mergeAll", { count: sure.length })}</Button></div>}
            <ul className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto">
              {groups.map((g) => (
                <li key={g.ids.join("|")} className="rounded-lg border border-vc-line p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <Tag tone={g.reason === "email" ? "info" : undefined}>{t(g.reason === "email" ? "contacts.duplicates.reasonEmail" : "contacts.duplicates.reasonName")}</Tag>
                    <Button type="button" disabled={busy} onClick={() => setConfirm(g)}>{t("contacts.duplicates.merge")}</Button>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {g.ids.flatMap((id) => (byId.has(id) ? [byId.get(id)!] : [])).map((c) => (
                      <li key={c.id} className="flex items-center gap-3">
                        <ContactAvatar contact={c} size={32} />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">{c.name}</span>
                          <span className="block truncate text-xs text-vc-text-secondary">{[c.emails.map((e) => e.address).join(", "), c.company].filter(Boolean).join(" · ")}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </>
        )}
        <div className="flex justify-end"><Button type="button" variant="secondary" onClick={onClose}>{t("contacts.close")}</Button></div>
      </div>
      <ConfirmModal isOpen={confirm !== null} onClose={() => setConfirm(null)} title={t("contacts.duplicates.confirmTitle")} confirmLabel={t("contacts.duplicates.merge")} cancelLabel={t("contacts.cancel")} danger onConfirm={() => void run()}>
        {confirm === "all" ? t("contacts.duplicates.confirmAll", { count: sure.length }) : t("contacts.duplicates.confirmBody", { count: confirmGroup?.ids.length ?? 0, name: keep?.name ?? "" })}
      </ConfirmModal>
    </Modal>
  );
}
