import { ReactNode } from "react";
import clsx from "clsx";

export interface TagProps {
  /** `success` pour un état actif (publié, activé) ; `neutral` sinon. @default "neutral" */
  tone?: "success" | "warning" | "danger" | "info" | "neutral";
  children: ReactNode;
  className?: string;
}

const TONES = {
  success: "border-vc-success/40 text-vc-success",
  warning: "border-vc-warning/40 text-vc-warning",
  danger: "border-vc-danger/40 text-vc-danger",
  info: "border-vc-main/40 text-vc-main",
  neutral: "border-vc-line-strong opacity-70",
};

/** Petite étiquette en majuscules (« Publiée », « Privée », « Bêta »). */
export default function Tag({ tone = "neutral", children, className }: TagProps) {
  return <span className={clsx("rounded border px-1.5 text-[10px] uppercase", TONES[tone], className)}>{children}</span>;
}
