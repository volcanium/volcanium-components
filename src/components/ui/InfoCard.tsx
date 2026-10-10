import { ReactNode, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { IconCheck, IconPencil, IconX } from "@tabler/icons-react";
import Input from "./Input";
import Textarea from "./Textarea";
import Select, { SelectOption } from "./Select";

export interface InfoCardProps {
  /** Petit titre de la case (ex. « Port »). */
  label: ReactNode;
  /** Ce qui est affiché au repos. */
  value: ReactNode;
  /** Rend la valeur modifiable d'un clic. */
  editable?: boolean;
  /** Type de champ affiché pendant la modification (@default "text"). */
  editType?: "text" | "number" | "password" | "textarea" | "select";
  /** Valeur de départ du champ (par défaut `value` s'il s'agit d'un texte / nombre). */
  editValue?: string;
  /** Choix proposés quand `editType` vaut `"select"`. */
  options?: SelectOption<string>[];
  /** Appelée avec la nouvelle valeur ; si elle rejette, l'erreur est affichée et le champ reste ouvert. */
  onSave?: (value: string) => void | Promise<void>;
  /** Renvoie un message d'erreur, ou null si la valeur est correcte. */
  validate?: (value: string) => string | null;
  placeholder?: string;
  /** Petite explication sous la valeur. */
  hint?: ReactNode;
  /** Police à chasse fixe (identifiants, chemins, commandes…). */
  mono?: boolean;
  /** Actions à droite du libellé (bouton copier, lien…). */
  actions?: ReactNode;
  className?: string;
}

/**
 * Case d'information : un libellé, une valeur. Au survol la case se met en évidence ; si elle est `editable`, un clic sur la valeur la transforme
 * en champ (Entrée ou ✓ pour valider, Échap ou ✕ pour annuler). À placer dans un `InfoGrid`.
 * @see {@link https://vcomponents.tmenv.fr/?path=/docs/ui-infocard--docs}
 */
export default function InfoCard({
  label,
  value,
  editable = false,
  editType = "text",
  editValue,
  options,
  onSave,
  validate,
  placeholder,
  hint,
  mono = false,
  actions,
  className,
}: InfoCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const canEdit = editable && !!onSave;
  const initial = editValue ?? (typeof value === "string" || typeof value === "number" ? String(value) : "");

  useEffect(() => {
    if (editing) box.current?.querySelector<HTMLElement>("input, textarea")?.focus();
  }, [editing]);

  const open = () => {
    if (!canEdit || editing) return;
    setDraft(initial);
    setError(null);
    setEditing(true);
  };
  const cancel = () => {
    setEditing(false);
    setError(null);
  };
  const commit = async (v = draft) => {
    if (saving) return;
    if (v === initial) return cancel();
    const bad = validate?.(v) ?? null;
    if (bad) return setError(bad);
    setSaving(true);
    try {
      await onSave!(v);
      setEditing(false);
      setError(null);
    } catch (err) {
      setError((err as Error).message || "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      cancel();
    } else if (e.key === "Enter" && !(editType === "textarea" && !e.ctrlKey && !e.metaKey)) {
      e.preventDefault();
      void commit();
    }
  };

  return (
    <div
      ref={box}
      className={clsx(
        "group relative flex min-w-0 flex-col gap-1 rounded-xl border bg-vc-container px-4 py-3 transition-colors",
        editing ? "border-vc-main" : "border-vc-line hover:border-vc-main/40 hover:bg-vc-veil",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs uppercase tracking-wide text-vc-text/50">{label}</span>
        {actions && <span className="flex items-center gap-1">{actions}</span>}
      </div>

      {editing ? (
        <div className="flex flex-col gap-2" onKeyDown={onKey}>
          {editType === "select" ? (
            <Select<string>
              options={options}
              value={draft}
              onChange={(v) => {
                setDraft(v);
                void commit(v);
              }}
            />
          ) : editType === "textarea" ? (
            <Textarea value={draft} placeholder={placeholder} onChange={(e) => setDraft(e.target.value)} rows={4} />
          ) : (
            <Input type={editType} value={draft} placeholder={placeholder} onChange={(e) => setDraft(e.target.value)} loading={saving} />
          )}
          {error && <span className="text-xs text-red-400">{error}</span>}
          <div className="flex items-center gap-2 text-xs text-vc-text/50">
            <button type="button" onClick={() => void commit()} disabled={saving} aria-label="Valider" className="cursor-pointer rounded-md bg-vc-main/90 p-1 text-white hover:bg-vc-main disabled:opacity-50">
              <IconCheck size={14} />
            </button>
            <button type="button" onClick={cancel} aria-label="Annuler" className="cursor-pointer rounded-md bg-vc-veil-strong p-1 hover:bg-vc-line-strong">
              <IconX size={14} />
            </button>
            <span>{editType === "textarea" ? "Ctrl+Entrée pour valider" : "Entrée pour valider"} · Échap pour annuler</span>
          </div>
        </div>
      ) : (
        <div
          onClick={open}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), open())}
          role={canEdit ? "button" : undefined}
          tabIndex={canEdit ? 0 : undefined}
          title={canEdit ? "Cliquer pour modifier" : undefined}
          className={clsx(
            "flex min-w-0 items-start justify-between gap-2 break-words text-sm",
            mono && "font-mono text-[13px]",
            canEdit && "cursor-pointer",
          )}
        >
          <span className="min-w-0 flex-1 break-words">{value === "" || value == null ? <span className="text-vc-text/40">—</span> : value}</span>
          {canEdit && <IconPencil size={14} className="mt-0.5 shrink-0 text-vc-text/0 transition-colors group-hover:text-vc-main" />}
        </div>
      )}
      {hint && !editing && <span className="text-xs text-vc-text/45">{hint}</span>}
    </div>
  );
}

/** Grille responsive de `InfoCard`. */
export function InfoGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3", className)}>{children}</div>;
}
