import clsx from "clsx";

export interface ProgressBarProps {
  /** Avancement de 0 à 1. */
  value: number;
  /** Nom accessible (ce qui progresse : « Envoi de rapport.pdf »). */
  label: string;
  /** Couleur de la barre. `auto` : normale, orange à partir de 80 %, rouge à partir de 95 % (jauge d'espace). @default "main" */
  tone?: "main" | "success" | "danger" | "auto";
  className?: string;
}

/** Barre de progression fine (envoi, jauge). Le pourcentage est exposé aux lecteurs d'écran (`role="progressbar"`). */
export default function ProgressBar({ value, label, tone = "main", className }: ProgressBarProps) {
  const ratio = Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
  const color = tone === "auto" ? (ratio >= 0.95 ? "bg-vc-danger" : ratio >= 0.8 ? "bg-vc-warning" : "bg-vc-main") : tone === "success" ? "bg-vc-success" : tone === "danger" ? "bg-vc-danger" : "bg-vc-main";
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(ratio * 100)} className={clsx("h-1.5 w-full overflow-hidden rounded-full bg-vc-line", className)}>
      <div className={clsx("h-full rounded-full transition-[width]", color)} style={{ width: `${ratio * 100}%` }} />
    </div>
  );
}
