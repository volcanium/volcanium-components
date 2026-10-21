import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

export interface ControlButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label" | "title" | "children"> {
  /** Nom accessible et info-bulle, obligatoire. */
  label: string;
  /** Icône. */
  icon: ReactNode;
  /** Interrupteur actif (micro coupé, partage en cours…) : fond de marque. */
  active?: boolean;
  /** Action finale (quitter) : rouge. */
  danger?: boolean;
  /** Pastille de compteur (participants, messages non lus). */
  count?: number;
}

/** Bouton rond d'une barre de contrôle de réunion (micro, caméra, partage d'écran, quitter…). */
export default function ControlButton({ label, icon, active = false, danger = false, count, className, type = "button", ...props }: ControlButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      aria-pressed={danger ? undefined : active}
      className={clsx(
        "relative inline-flex h-11 min-w-11 cursor-pointer items-center justify-center rounded-full border px-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vc-main/50 disabled:cursor-not-allowed disabled:opacity-40",
        danger ? "border-transparent bg-vc-danger text-vc-on-main hover:opacity-90" : active ? "border-transparent bg-vc-main text-vc-on-main hover:opacity-90" : "border-vc-line-strong bg-vc-veil text-vc-text hover:bg-vc-veil-strong",
        className,
      )}
      {...props}
    >
      {icon}
      {count !== undefined && count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-vc-main px-1 text-[10px] font-semibold tabular-nums text-vc-on-main">{count > 99 ? "99+" : count}</span>
      )}
    </button>
  );
}
