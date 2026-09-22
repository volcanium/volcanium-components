import { twMerge } from "tailwind-merge";
import { ReactNode } from "react";

/**
 * Heading hierarchy levels — pick the one that matches the title's actual
 * importance on the page, instead of overriding size/weight ad hoc via
 * `className` everywhere.
 */
export type TitleLevel = "display" | "lg" | "md" | "sm";

/**
 * "brand" keeps the decorative display typeface (Rammetto One) — reserved for
 * the actual "Account" / "Volcanium" wordmark. Everything else ("default")
 * uses the regular sans-serif font at a heavier weight: readable and much
 * less visually loud for ordinary section/card titles.
 */
export type TitleVariant = "brand" | "default";

export interface TitleProps {
  children: ReactNode;
  className?: string;
  level?: TitleLevel;
  variant?: TitleVariant;
}

const LEVEL_STYLES: Record<TitleLevel, string> = {
  display: "text-4xl sm:text-5xl font-bold",
  lg: "text-2xl font-semibold",
  md: "text-xl font-semibold",
  sm: "text-sm font-medium",
};

export default function Title({
  children,
  className,
  level = "lg",
  variant = "default",
}: TitleProps) {
  return (
    <h2
      className={twMerge(
        "text-vc-secondary leading-snug",
        LEVEL_STYLES[level],
        variant === "brand" ? "font-vc-title tracking-wide" : "font-vc-main",
        className,
      )}
    >
      {children}
    </h2>
  );
}
