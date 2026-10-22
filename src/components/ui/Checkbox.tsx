import { InputHTMLAttributes, ReactNode, useId } from "react";
import clsx from "clsx";
import { IconCheck } from "@tabler/icons-react";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "checked" | "children"> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Texte à côté de la case (cliquable). Peut contenir un lien : le clic sur le lien ne coche pas. */
  label?: ReactNode;
  /** Phrase d'explication sous le libellé. */
  hint?: ReactNode;
  className?: string;
}

/**
 * Case à cocher (consentement, permission, sélection). Pour un réglage qui s'applique tout de suite, préférer `Toggle`.
 * Le champ natif reste dans la page (clavier, formulaires, lecteurs d'écran) ; la case dessinée suit les jetons `vc-*`.
 */
export default function Checkbox({ checked, onChange, label, hint, className, disabled, id, ...props }: CheckboxProps) {
  const generated = useId();
  const inputId = id ?? generated;
  return (
    <div className={clsx("flex items-start gap-2.5", disabled && "opacity-50", className)}>
      <span className="relative mt-0.5 inline-flex h-4 w-4 shrink-0">
        <input
          {...props}
          id={inputId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="peer absolute inset-0 m-0 h-full w-full cursor-pointer appearance-none rounded-sm border border-vc-line-strong bg-vc-container transition-colors checked:border-vc-main checked:bg-vc-main hover:border-vc-text/30 checked:hover:border-vc-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vc-main/50 disabled:cursor-not-allowed"
        />
        <IconCheck size={12} stroke={3} aria-hidden="true" className="pointer-events-none absolute left-0.5 top-0.5 text-vc-on-main opacity-0 peer-checked:opacity-100" />
      </span>
      {(label || hint) && (
        <label htmlFor={inputId} className={clsx("min-w-0 text-sm max-sm:py-1.5", !disabled && "cursor-pointer")}>
          {label}
          {hint && <span className="block text-xs text-vc-text/60">{hint}</span>}
        </label>
      )}
    </div>
  );
}
