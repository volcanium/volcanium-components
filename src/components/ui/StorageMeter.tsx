import type { ReactNode } from "react";
import clsx from "clsx";

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
  const tone = ratio >= 0.95 ? "bg-vc-danger" : ratio >= 0.8 ? "bg-vc-warning" : "bg-vc-main";
  return (
    <div className={clsx("text-xs", className)}>
      {total !== null && (
        <div role="progressbar" aria-label={ariaLabel} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(ratio * 100)} className="mb-1.5 h-1.5 w-full overflow-hidden rounded-full bg-vc-line">
          <div className={clsx("h-full rounded-full transition-[width]", tone)} style={{ width: `${Math.max(ratio * 100, used > 0 ? 2 : 0)}%` }} />
        </div>
      )}
      <div className="opacity-70">{label}</div>
    </div>
  );
}
