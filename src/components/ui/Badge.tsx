import { ReactNode } from "react";
import clsx from "clsx";

export type BadgeTone = "success" | "warning" | "danger" | "info" | "wait" | "neutral";

export interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  /** Info-bulle. */
  title?: string;
  className?: string;
}

const TONES: Record<BadgeTone, { color: string; glyph: string }> = {
  success: { color: "text-vc-success", glyph: "●" },
  warning: { color: "text-vc-warning", glyph: "▲" },
  danger: { color: "text-vc-danger", glyph: "●" },
  info: { color: "text-vc-main", glyph: "◆" },
  wait: { color: "opacity-70", glyph: "◌" },
  neutral: { color: "opacity-50", glyph: "○" },
};

/** Un état en « ● En ligne » : pastille + mot + couleur, pour que la couleur ne soit jamais le seul signal. */
export default function Badge({ tone = "neutral", children, title, className }: BadgeProps) {
  const t = TONES[tone];
  return (
    <span className={clsx(t.color, className)} title={title}>
      <span aria-hidden="true">{t.glyph}</span> {children}
    </span>
  );
}
