import type { CalendarInfo } from "./types";

export const PALETTE = ["#2563eb", "#e11d48", "#16a34a", "#d97706", "#7c3aed", "#0891b2", "#db2777", "#4b5563"] as const;
export const DEFAULT_COLOR = PALETTE[0];

export const colorOf = (cal: Pick<CalendarInfo, "color"> | undefined): string => cal?.color ?? DEFAULT_COLOR;

/** Couleur de texte lisible sur un fond `#rrggbb` (luminance relative WCAG). */
export function readableOn(hex: string): "#ffffff" | "#111827" {
  const n = /^#[0-9a-f]{6}$/i.test(hex) ? parseInt(hex.slice(1), 16) : 0x2563eb;
  const lin = (c: number) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const lum = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
  return lum > 0.4 ? "#111827" : "#ffffff";
}
