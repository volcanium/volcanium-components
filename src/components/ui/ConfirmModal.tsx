import { ReactNode, useEffect, useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import Input from "./Input";
import { useLanguage } from "../../utils/useLanguage";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** Texte d'explication. */
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Style « destructif » du bouton de confirmation. */
  danger?: boolean;
  /** Exécutée à la confirmation ; si elle rejette, l'erreur est affichée et la fenêtre reste ouverte. La fenêtre se ferme sinon. */
  onConfirm: () => void | Promise<unknown>;
  /** Exige de recopier ce texte avant d'activer le bouton (actions irréversibles). */
  requireText?: string;
  /** Bouton supplémentaire (ex. variante de l'action). */
  secondary?: { label: string; onClick: () => void | Promise<unknown> };
}

/** Fenêtre de confirmation (remplace `window.confirm`). */
export default function ConfirmModal({ isOpen, onClose, title, children, confirmLabel, cancelLabel, danger, onConfirm, requireText, secondary }: ConfirmModalProps) {
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (isOpen) {
      setTyped("");
      setError(null);
    }
  }, [isOpen]);

  const run = async (fn: () => void | Promise<unknown>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      onClose();
    } catch (err) {
      setError((err as Error).message || t("action_failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} buttons={false}>
      <div className="flex flex-col gap-3 text-sm">
        {children && <div>{children}</div>}
        {requireText && <Input label={t("confirm_retype", { text: requireText })} value={typed} onChange={(e) => setTyped(e.target.value)} />}
        {error && <p className="text-vc-danger">{error}</p>}
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            {cancelLabel ?? t("cancel")}
          </Button>
          {secondary && (
            <Button variant="secondary" disabled={busy} onClick={() => void run(secondary.onClick)}>
              {secondary.label}
            </Button>
          )}
          <Button variant={danger ? "dangerous" : "primary"} loading={busy} disabled={busy || (!!requireText && typed !== requireText)} onClick={() => void run(onConfirm)}>
            {confirmLabel ?? t("confirm")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  label: string;
  initialValue?: string;
  placeholder?: string;
  confirmLabel?: string;
  onSubmit: (value: string) => void | Promise<unknown>;
}

/** Fenêtre de saisie d'une valeur (remplace `window.prompt`). Entrée valide. */
export function PromptModal({ isOpen, onClose, title, label, initialValue = "", placeholder, confirmLabel, onSubmit }: PromptModalProps) {
  const { t } = useLanguage();
  const [value, setValue] = useState(initialValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
      setError(null);
    }
  }, [isOpen, initialValue]);

  const submit = async () => {
    if (!value.trim() || busy) return;
    setBusy(true);
    try {
      await onSubmit(value.trim());
      onClose();
    } catch (err) {
      setError((err as Error).message || t("action_failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} buttons={false}>
      <form
        className="flex flex-col gap-3 text-sm"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <Input label={label} value={value} placeholder={placeholder} onChange={(e) => setValue(e.target.value)} autoFocus />
        {error && <p className="text-vc-danger">{error}</p>}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>
            Annuler
          </Button>
          <Button type="submit" loading={busy} disabled={busy || !value.trim()}>
            {confirmLabel ?? t("validate")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
