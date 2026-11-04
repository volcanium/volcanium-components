import { useEffect, useId, useLayoutEffect, useRef, useState, ReactNode } from "react";
import { createPortal } from "react-dom";
import { Squircle } from "@squircle-js/react";
import { IconClock } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../utils/useLanguage";
import { useClickOutside } from "../../utils/useDropdown";

export interface TimePickerProps {
  /** Heure au format 24 h `HH:mm` (comme `<input type="time">`). `""` ou absent = vide. */
  value?: string | null;
  /** Appelée avec `HH:mm`, ou `""` quand le champ est vidé. */
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: ReactNode;
  id?: string;
  className?: string;
  disabled?: boolean;
  /** Pas (en minutes) de la liste de créneaux proposée. La saisie, elle, est libre à la minute. @default 15 */
  step?: number;
}

/** Comprend `930`, `9:30`, `9h30`, `09.30`, `9` (= 09:00) ; renvoie `HH:mm` ou `null`. */
export function parseTypedTime(raw: string): string | null {
  const text = raw.trim().toLowerCase();
  if (!text) return null;
  const m = /^(\d{1,2})(?:\s*[:h.]\s*(\d{1,2})?)?$/.exec(text) ?? /^(\d{1,2})(\d{2})$/.exec(text);
  if (!m) return null;
  const h = Number(m[1]);
  const min = m[2] === undefined || m[2] === "" ? 0 : Number(m[2]);
  if (h > 23 || min > 59) return null;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

/**
 * Sélecteur d'heure remplaçant `<input type="time">` : l'heure se tape au clavier (`0930`, `9h30`, `9:30`…, deux-points
 * insérés pendant la frappe, validée à Entrée / perte de focus) ou se choisit dans une liste de créneaux (flèche bas).
 */
export default function TimePicker({ value, onChange, placeholder, label, id, className = "", disabled = false, step = 15 }: TimePickerProps) {
  const { t } = useLanguage();
  const [text, setText] = useState(value ?? "");
  const [invalid, setInvalid] = useState(false);
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<{ left: number; width: number; top?: number; bottom?: number } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement | null>(null);
  const generatedId = useId();
  const fieldId = id || generatedId;

  useEffect(() => {
    setText(value ?? "");
    setInvalid(false);
  }, [value]);

  useClickOutside(wrapperRef, panelRef, () => setOpen(false));

  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const r = wrapperRef.current?.getBoundingClientRect();
      if (!r) return;
      const margin = 8;
      const maxH = 240;
      const below = window.innerHeight - r.bottom;
      const up = below < maxH && r.top > below;
      const width = Math.max(r.width, 112);
      const left = Math.max(margin, Math.min(r.left, window.innerWidth - width - margin));
      setRect(up ? { left, width, bottom: window.innerHeight - r.top + margin } : { left, width, top: r.bottom + margin });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open]);

  useEffect(() => {
    if (open && rect) selectedRef.current?.scrollIntoView({ block: "center" });
  }, [open, rect === null]);

  const slots: string[] = [];
  for (let m = 0; m < 24 * 60; m += Math.max(1, step)) slots.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);

  const commit = (v: string) => {
    setText(v);
    setInvalid(false);
    if (v !== (value ?? "")) onChange?.(v);
  };

  const handleChange = (raw: string) => {
    if (raw === "") {
      commit("");
      return;
    }
    const digits = raw.replace(/[^\d]/g, "").slice(0, 4);
    // Frappe de chiffres seuls : `0930` -> `09:30` ; sinon (`9h30`, `9:5`) on garde la saisie telle quelle, analysée à Entrée / blur.
    const plain = /^[\d:]*$/.test(raw) && [...raw].every((c, i) => c !== ":" || i === 2);
    const next = plain ? (digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits) : raw.slice(0, 6);
    setText(next);
    setInvalid(false);
    if (plain && next.length === 5) {
      const parsed = parseTypedTime(next);
      if (parsed) commit(parsed);
    }
  };

  const settle = (revert: boolean) => {
    if (!text.trim()) {
      setInvalid(false);
      return;
    }
    const parsed = parseTypedTime(text);
    if (parsed) commit(parsed);
    else if (revert) {
      setText(value ?? "");
      setInvalid(false);
    } else setInvalid(true);
  };

  const panel = createPortal(
    <AnimatePresence>
      {open && rect && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: rect.bottom !== undefined ? 5 : -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: rect.bottom !== undefined ? 5 : -5 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{ position: "fixed", left: rect.left, width: rect.width, top: rect.top, bottom: rect.bottom }}
          className="z-999 font-vc-main text-vc-text"
        >
          <Squircle cornerRadius={10} cornerSmoothing={1} asChild>
            <div role="listbox" aria-label={t("open_time_list")} className="max-h-60 overflow-y-auto bg-vc-container border border-vc-line p-1 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.55)]">
              {slots.map((slot) => {
                const isSelected = slot === value;
                return (
                  <button
                    key={slot}
                    ref={isSelected ? selectedRef : undefined}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      commit(slot);
                      setOpen(false);
                    }}
                    className={`block w-full rounded-md px-3 py-1.5 max-sm:py-2.5 text-start text-sm tabular-nums cursor-pointer transition-colors duration-150 ${
                      isSelected ? "bg-vc-main text-vc-on-main" : "text-vc-secondary/85 hover:bg-vc-veil-strong"
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </Squircle>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );

  const Wrapper = (
    <div ref={wrapperRef} className="relative flex w-full font-vc-main text-vc-text">
      <Squircle asChild cornerRadius={7} cornerSmoothing={1}>
        <div
          className={`flex items-center w-full gap-2 pl-3.5 pr-2 border bg-vc-container transition-colors duration-200 ${invalid ? "border-vc-danger/60 focus-within:border-vc-danger" : "border-vc-line-strong focus-within:border-vc-main/60"} ${disabled ? "opacity-50" : ""} ${className}`}
        >
          <input
            id={fieldId}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={text}
            disabled={disabled}
            placeholder={placeholder || t("time_placeholder")}
            aria-invalid={invalid || undefined}
            title={invalid ? t("time_invalid") : undefined}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={() => settle(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") settle(false);
              else if (e.key === "ArrowDown" && !open) {
                e.preventDefault();
                setOpen(true);
              }
            }}
            className="flex-1 w-full min-w-0 bg-transparent py-2 max-sm:py-2.5 max-sm:text-base outline-none tabular-nums placeholder:text-vc-secondary/40 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOpen((v) => !v)}
            aria-label={t("open_time_list")}
            aria-haspopup="listbox"
            aria-expanded={open}
            className="flex h-7 w-7 max-sm:h-10 max-sm:w-10 shrink-0 items-center justify-center rounded-full text-vc-secondary/50 transition-colors duration-150 hover:bg-vc-veil-strong hover:text-vc-secondary cursor-pointer disabled:cursor-not-allowed"
          >
            <IconClock size={16} />
          </button>
        </div>
      </Squircle>
      {panel}
    </div>
  );

  return label ? (
    <div className="flex flex-col gap-1">
      {Wrapper}
      <label className="-mt-1 mb-1 text-start text-sm text-vc-text/50" htmlFor={fieldId}>
        {label}
      </label>
    </div>
  ) : (
    Wrapper
  );
}
