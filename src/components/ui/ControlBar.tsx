import type { ReactNode } from "react";
import clsx from "clsx";

export interface ControlBarProps {
  /** Nom de la barre pour les lecteurs d'écran (« Commandes de la réunion »). */
  label: string;
  /** Les `ControlButton`, dans l'ordre d'affichage. */
  children: ReactNode;
  className?: string;
}

/** Barre de contrôle centrée au bas d'une réunion : regroupe les `ControlButton`. */
export default function ControlBar({ label, children, className }: ControlBarProps) {
  return (
    <div role="toolbar" aria-label={label} className={clsx("flex flex-wrap items-center justify-center gap-2 rounded-full border border-vc-line bg-vc-container px-3 py-2 max-sm:max-w-full max-sm:gap-1.5", className)}>
      {children}
    </div>
  );
}
