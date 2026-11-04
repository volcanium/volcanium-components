import { useId, useLayoutEffect, useRef, forwardRef, ReactNode, TextareaHTMLAttributes } from "react";
import { Squircle } from "@squircle-js/react";
import { twMerge } from "tailwind-merge";

export interface TextareaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "label"
> {
  /** Classes ajoutées au champ lui-même (elles l'emportent sur les classes par défaut : `className="min-h-40"`). */
  className?: string;
  label?: ReactNode;
  id?: string;
  variant?: "one" | "secondary";
  /** Poignée de redimensionnement. Par défaut verticale seulement (la largeur reste celle du conteneur). @default "vertical" */
  resize?: "none" | "vertical" | "horizontal" | "both";
  /** Nombre de lignes visibles au départ. @default 3 */
  rows?: number;
  /** La hauteur suit le contenu (de `rows` à `maxRows` lignes, puis défilement). Désactive la poignée de redimensionnement. @default false */
  autoGrow?: boolean;
  /** Avec `autoGrow` : lignes maximum avant défilement. @default 10 */
  maxRows?: number;
}

const RESIZE_MAP = {
  none: "resize-none",
  vertical: "resize-y",
  horizontal: "resize-x",
  both: "resize",
};

/**
 * Zone de texte multiligne : même bordure, rayon, marges et typographie que `Input`, largeur 100 % du conteneur,
 * 3 lignes par défaut (`rows`), redimensionnable en hauteur ou à hauteur automatique (`autoGrow`).
 */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, label, id, variant = "one", resize = "vertical", rows = 3, autoGrow = false, maxRows = 10, onChange, value, ...props },
  forwardedRef,
) {
  const variants = {
    one: "bg-vc-container",
    secondary: "bg-vc-container",
  };

  const generatedId = useId();
  const textareaId = id || generatedId;
  const local = useRef<HTMLTextAreaElement | null>(null);

  const fit = () => {
    const el = local.current;
    if (!el || !autoGrow) return;
    const style = getComputedStyle(el);
    const line = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.5 || 24;
    const pad = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    el.style.height = "auto";
    const max = line * maxRows + pad;
    el.style.height = `${Math.min(el.scrollHeight + (parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth)), max)}px`;
    el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
  };

  useLayoutEffect(fit, [value, autoGrow, maxRows, rows]);

  const TextareaEl = (
    <Squircle asChild cornerRadius={7} cornerSmoothing={1}>
      <textarea
        {...props}
        value={value}
        rows={rows}
        onChange={(e) => {
          onChange?.(e);
          fit();
        }}
        ref={(el) => {
          local.current = el;
          if (typeof forwardedRef === "function") forwardedRef(el);
          else if (forwardedRef) forwardedRef.current = el;
        }}
        id={textareaId}
        className={twMerge(
          "block w-full min-w-0 max-w-full px-3.5 py-2 max-sm:py-2.5 max-sm:text-base border border-vc-line-strong outline-none transition-colors duration-200 focus:border-vc-main/60 disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-vc-secondary/40",
          variants[variant],
          autoGrow ? "resize-none" : RESIZE_MAP[resize],
          className,
        )}
      />
    </Squircle>
  );

  return label ? (
    <div className="flex flex-col gap-1">
      {TextareaEl}
      <label
        className="w-full -mt-1 mb-1 text-start text-sm text-vc-text/50"
        htmlFor={textareaId}
      >
        {label}
      </label>
    </div>
  ) : (
    TextareaEl
  );
});

export default Textarea;
