import { ReactNode } from "react";
import clsx from "clsx";

export type NoticeTone = "info" | "success" | "warning" | "danger";

export interface NoticeProps {
  /** Gravité : décide la couleur et le rôle ARIA (`alert` sauf pour `info`/`success`, qui sont des `status`). @default "warning" */
  tone?: NoticeTone;
  /** Titre court en gras au-dessus du message. */
  title?: ReactNode;
  /** Bouton ou lien à droite du message (ex. « Réessayer »). */
  action?: ReactNode;
  /** Version serrée : petit texte, peu de marge (avertissement discret au-dessus d'une liste). @default false */
  dense?: boolean;
  children: ReactNode;
  className?: string;
}

const TONES: Record<NoticeTone, string> = {
  info: "border-vc-line bg-vc-veil text-vc-text",
  success: "border-vc-success/30 bg-vc-success/10 text-vc-success",
  warning: "border-vc-warning/30 bg-vc-warning/10 text-vc-warning",
  danger: "border-vc-danger/30 bg-vc-danger/5 text-vc-danger",
};

/**
 * Bandeau d'information ou d'alerte (message d'erreur, avertissement, confirmation).
 * Les couleurs suivent les jetons `vc-danger` / `vc-warning` / `vc-success`, donc le clair et le sombre.
 */
export default function Notice({ tone = "warning", title, action, dense, children, className }: NoticeProps) {
  const polite = tone === "info" || tone === "success";
  return (
    <div
      role={polite ? "status" : "alert"}
      className={clsx("rounded-lg border", dense ? "p-2 text-xs" : "p-3 text-sm", TONES[tone], className)}
    >
      <div className={clsx(action && "flex flex-wrap items-center justify-between gap-3")}>
        <div>
          {title && <p className="font-semibold">{title}</p>}
          <div>{children}</div>
        </div>
        {action}
      </div>
    </div>
  );
}
