import { useState } from "react";
import Button from "../components/ui/Button";
import Textarea from "../components/ui/Textarea";
import TextButton from "../components/ui/TextButton";
import { notify } from "../components/ui/notify";
import { useLanguage, type TranslationKey } from "../utils/useLanguage";
import { useCompteAccess } from "../presence/PresenceProvider";

const REASONS = ["harassment", "impersonation", "inappropriate", "privacy", "other"] as const;

/**
 * Signalement d'un profil a la moderation de Volcanium (via Compte, qui le transmet a Internal). Motif obligatoire (liste fermee), precisions facultatives.
 * La moderation ne voit que ce que la personne qui signale voyait ; rien n'est envoye d'autre que le motif et ces precisions.
 */
export default function ReportForm({ userId, onDone }: { userId: string; onDone: () => void }) {
  const { t } = useLanguage();
  const access = useCompteAccess();
  const [reason, setReason] = useState<(typeof REASONS)[number] | null>(null);
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (!reason || !access || busy) return;
    setBusy(true);
    try {
      const res = await fetch(`${access.base}/user/profiles/${encodeURIComponent(userId)}/report?expect=${encodeURIComponent(access.userId)}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, ...(details.trim() ? { details: details.trim() } : {}) }),
      });
      if (res.ok) { notify.success(t("report_sent")); onDone(); } else notify.error(t(res.status === 429 ? "report_limit" : "report_failed"));
    } catch {
      notify.error(t("report_failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); void send(); }} className="space-y-2">
      <fieldset className="space-y-1">
        <legend className="mb-1 text-sm font-semibold">{t("report_title")}</legend>
        {REASONS.map((r) => (
          <label key={r} className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="radio" name="profile-report-reason" checked={reason === r} onChange={() => setReason(r)} />
            {t(`report_reason_${r}` as TranslationKey)}
          </label>
        ))}
      </fieldset>
      <Textarea label={t("report_details")} className="w-full" value={details} maxLength={1000} onChange={(e) => setDetails(e.target.value)} />
      <div className="flex items-center justify-end gap-3">
        <TextButton onClick={onDone}>{t("cancel")}</TextButton>
        <Button type="submit" variant="primary" loading={busy} disabled={!reason || busy}>{t("report_send")}</Button>
      </div>
    </form>
  );
}
