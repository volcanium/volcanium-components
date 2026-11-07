import type { ReactNode } from "react";
import clsx from "clsx";
import ProgressBar from "./ProgressBar";

export interface StorageMeterProps {
  /** Espace utilisé (octets). */
  used: number;
  /** Espace total (octets) ; `null` = illimité (aucune barre, seulement `label`). */
  total: number | null;
  /** Texte affiché sous la barre (ex. « 12,3 Go utilisés sur 50 Go »). */
  label: ReactNode;
  /** Nom accessible de la jauge. */
  ariaLabel: string;
  className?: string;
}

/** Jauge d'espace de stockage : orange à partir de 80 %, rouge à partir de 95 % (le texte en dit autant que la couleur). */
export default function StorageMeter({ used, total, label, ariaLabel, className }: StorageMeterProps) {
  const ratio = total && total > 0 ? Math.min(1, Math.max(0, used / total)) : 0;
  return (
    <div className={clsx("text-xs", className)}>
      {total !== null && <ProgressBar className="mb-1.5" tone="auto" label={ariaLabel} value={used > 0 ? Math.max(ratio, 0.02) : 0} />}
      <div className="opacity-70">{label}</div>
    </div>
  );
}
