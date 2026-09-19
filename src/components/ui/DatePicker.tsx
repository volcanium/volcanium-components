import {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useId,
  ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  addMonths,
  subMonths,
  setMonth,
  setYear,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isValid,
  format,
  parse,
} from "date-fns";
import { fr, enUS, es } from "date-fns/locale";
import type { Locale } from "date-fns";
import { Squircle } from "@squircle-js/react";
import { IconCalendar, IconChevronDown, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../utils/useLanguage";
import { useClickOutside } from "../../utils/useDropdown";

export type DatePickerLanguage = "fr" | "en" | "es";

const LOCALES: Record<DatePickerLanguage, Locale> = { fr, en: enUS, es };

/** `dd/MM/yyyy` for fr/es, `MM/dd/yyyy` for en — matches each locale's usual written order. */
const INPUT_PATTERNS: Record<DatePickerLanguage, string> = {
  fr: "dd/MM/yyyy",
  es: "dd/MM/yyyy",
  en: "MM/dd/yyyy",
};

const PLACEHOLDERS: Record<DatePickerLanguage, string> = {
  fr: "jj/mm/aaaa",
  es: "dd/mm/aaaa",
  en: "mm/dd/yyyy",
};

export interface DatePickerProps {
  /** Selected date, either a `Date` or an ISO `yyyy-MM-dd` string. */
  value?: Date | string | null;
  /** Called with an ISO `yyyy-MM-dd` string, matching the native `<input type="date">` contract. */
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: ReactNode;
  id?: string;
  className?: string;
  disabled?: boolean;
  /** Earliest selectable date. */
  minDate?: Date;
  /** Latest selectable date. */
  maxDate?: Date;
  /**
   * Locale driving month/weekday names and the typed-input date order
   * (`dd/MM/yyyy` for fr/es, `MM/dd/yyyy` for en). Defaults to the
   * `VolcaniumProvider` language, falling back to `"fr"`.
   */
  language?: DatePickerLanguage;
}

interface PanelPosition {
  left: number;
  width: number;
  top?: number;
  bottom?: number;
}

function toDate(value?: Date | string | null): Date | null {
  if (!value) return null;
  if (value instanceof Date) return isValid(value) ? value : null;
  const parsed = parse(value, "yyyy-MM-dd", new Date());
  return isValid(parsed) ? parsed : null;
}

function resolveLanguage(lang: string): DatePickerLanguage {
  return lang === "en" || lang === "es" ? lang : "fr";
}

const CURRENT_YEAR = new Date().getFullYear();
// Generous range so far-off dates (e.g. a birth date) are always one dropdown
// pick away instead of hundreds of "previous month" clicks.
const YEAR_RANGE = { min: CURRENT_YEAR - 120, max: CURRENT_YEAR + 20 };

/**
 * A calendar date picker replacing the native `<input type="date">`.
 *
 * The value can always be typed directly, as plain text in the locale's
 * usual order (`dd/MM/yyyy` fr/es, `MM/dd/yyyy` en) — the calendar itself is
 * optional, opened only by clicking the calendar icon. Keeps the native
 * `onChange` contract: an ISO `"yyyy-MM-dd"` string.
 */
export default function DatePicker({
  value,
  onChange,
  placeholder,
  label,
  id,
  className = "",
  disabled = false,
  minDate,
  maxDate,
  language,
}: DatePickerProps) {
  const { language: providerLanguage } = useLanguage();
  const lang = language || resolveLanguage(providerLanguage);
  const locale = LOCALES[lang];
  const pattern = INPUT_PATTERNS[lang];

  const selected = toDate(value);

  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<PanelPosition | null>(null);
  const [cursor, setCursor] = useState(() => selected ?? new Date());
  const [text, setText] = useState(() => (selected ? format(selected, pattern) : ""));
  const [yearText, setYearText] = useState(() => String((selected ?? new Date()).getFullYear()));
  const [monthMenuOpen, setMonthMenuOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const monthPickerRef = useRef<HTMLDivElement>(null);
  const yearInputRef = useRef<HTMLInputElement | null>(null);
  // Holds the latest closure so the stable `swallowEnterRef` listener always
  // sees fresh `yearText`/`cursor` without needing to be re-attached.
  const onYearEnterRef = useRef(() => {});
  const swallowEnterRef = useRef((e: KeyboardEvent) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    if (e.type === "keyup") onYearEnterRef.current();
  });

  const generatedId = useId();
  const pickerId = id || generatedId;

  // Keep the typed text in sync with external value changes (but don't
  // fight the user while they're actively editing).
  useEffect(() => {
    setText(selected ? format(selected, pattern) : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, lang]);

  useEffect(() => {
    setYearText(String(cursor.getFullYear()));
  }, [cursor]);

  onYearEnterRef.current = () => {
    const y = Number(yearText);
    if (yearText.length === 4 && y >= YEAR_RANGE.min && y <= YEAR_RANGE.max) {
      setCursor((c) => setYear(c, y));
    } else {
      setYearText(String(cursor.getFullYear()));
    }
    yearInputRef.current?.blur();
  };

  useClickOutside(wrapperRef, panelRef, () => setOpen(false));

  useEffect(() => {
    if (!monthMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (!monthPickerRef.current?.contains(e.target as Node)) setMonthMenuOpen(false);
    };
    window.addEventListener("click", handler, true);
    return () => window.removeEventListener("click", handler, true);
  }, [monthMenuOpen]);

  useLayoutEffect(() => {
    if (!open) return;
    setCursor(selected ?? new Date());
    const updatePosition = () => {
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (!rect) return;
      const margin = 8;
      const panelWidth = 296;
      const maxPanelHeight = 360;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const openUpward = spaceBelow < maxPanelHeight && spaceAbove > spaceBelow;
      // The panel has a fixed, sensible width regardless of how wide the
      // trigger field is (it can span an entire modal) — clamped so it
      // never overflows the right edge of the viewport.
      const left = Math.min(rect.left, window.innerWidth - panelWidth - margin);
      setPosition(
        openUpward
          ? { left, width: panelWidth, bottom: window.innerHeight - rect.top + margin }
          : { left, width: panelWidth, top: rect.bottom + margin },
      );
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 }),
  });

  const weekdayLabels = eachDayOfInterval({
    start: startOfWeek(new Date(), { weekStartsOn: 1 }),
    end: endOfWeek(new Date(), { weekStartsOn: 1 }),
  }).map((d) => format(d, "EEEEE", { locale }));

  const monthLabels = Array.from({ length: 12 }, (_, i) =>
    format(setMonth(new Date(), i), "LLLL", { locale }),
  );

  const isDisabled = (day: Date) =>
    (minDate && day < minDate) || (maxDate && day > maxDate);

  const commit = (day: Date) => {
    if (isDisabled(day)) return;
    onChange?.(format(day, "yyyy-MM-dd"));
    setText(format(day, pattern));
  };

  const selectDay = (day: Date) => {
    commit(day);
    setOpen(false);
  };

  // Native, capture-phase listener directly on the year input inside the
  // open calendar popup: Enter there must never bubble out to close the
  // calendar or submit a Modal (unlike the main field, where Enter should
  // submit normally) — a React onKeyDown/onKeyUp stopPropagation isn't
  // reliably enough since a Modal listens natively on `window`.
  //
  // Attached via a ref callback (not a `useEffect` keyed on `open`) because
  // the panel only mounts once `position` is computed a render *after*
  // `open` flips true — an effect keyed on `open` alone would run before
  // the node exists and never re-run to pick it up.
  const setYearInputRef = (el: HTMLInputElement | null) => {
    yearInputRef.current?.removeEventListener("keydown", swallowEnterRef.current, true);
    yearInputRef.current?.removeEventListener("keyup", swallowEnterRef.current, true);
    yearInputRef.current = el;
    el?.addEventListener("keydown", swallowEnterRef.current, true);
    el?.addEventListener("keyup", swallowEnterRef.current, true);
  };

  const handleTextChange = (raw: string) => {
    // Auto-insert separators as the user types digits (e.g. "0109" -> "01/09").
    const digits = raw.replace(/[^\d]/g, "").slice(0, 8);
    let next = digits;
    if (digits.length > 4) next = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    else if (digits.length > 2) next = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    setText(next);

    if (next.length === pattern.length) {
      const parsed = parse(next, pattern, new Date());
      if (isValid(parsed) && !isDisabled(parsed)) {
        onChange?.(format(parsed, "yyyy-MM-dd"));
        setCursor(parsed);
      }
    }
  };

  const handleTextBlur = () => {
    // Revert to the last valid value's formatting if what's typed doesn't parse.
    if (text && text.length === pattern.length) {
      const parsed = parse(text, pattern, new Date());
      if (isValid(parsed) && !isDisabled(parsed)) return;
    }
    setText(selected ? format(selected, pattern) : "");
  };

  const panel = createPortal(
    <AnimatePresence>
      {open && position && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: position.bottom !== undefined ? 5 : -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: position.bottom !== undefined ? 5 : -5 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          style={{
            position: "fixed",
            left: position.left,
            width: position.width,
            top: position.top,
            bottom: position.bottom,
          }}
          className="z-999 font-main text-text"
        >
          <Squircle cornerRadius={16} cornerSmoothing={1} asChild>
            <div className="bg-container shadow-[0_16px_40px_-16px_rgba(0,0,0,0.55)] border border-line p-3 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setCursor((c) => subMonths(c, 1))}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-secondary/60 transition-colors duration-150 hover:bg-veil hover:text-secondary cursor-pointer"
                  aria-label="Previous month"
                >
                  <IconChevronLeft size={16} />
                </button>

                <div className="flex items-center gap-1.5 min-w-0">
                  <div ref={monthPickerRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setMonthMenuOpen((v) => !v)}
                      className="flex items-center gap-1 px-2 py-1 rounded-md text-sm font-semibold text-secondary capitalize transition-colors duration-150 hover:bg-veil cursor-pointer"
                    >
                      {monthLabels[cursor.getMonth()]}
                      <IconChevronDown size={13} className="text-secondary/50" />
                    </button>
                    <AnimatePresence>
                      {monthMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                          className="absolute left-0 top-full mt-1 z-10 grid grid-cols-3 gap-1 p-2 w-48 bg-container border border-line rounded-xl shadow-[0_16px_40px_-16px_rgba(0,0,0,0.55)]"
                        >
                          {monthLabels.map((m, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                setCursor((c) => setMonth(c, i));
                                setMonthMenuOpen(false);
                              }}
                              className={`px-2 py-1.5 rounded-md text-xs capitalize truncate transition-colors duration-150 cursor-pointer hover:bg-veil-strong ${
                                i === cursor.getMonth() ? "bg-main/20 text-secondary" : "text-secondary/75"
                              }`}
                            >
                              {m}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <input
                    ref={setYearInputRef}
                    type="text"
                    inputMode="numeric"
                    value={yearText}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/[^\d]/g, "").slice(0, 4);
                      setYearText(digits);
                      if (digits.length === 4) {
                        const y = Number(digits);
                        if (y >= YEAR_RANGE.min && y <= YEAR_RANGE.max) {
                          setCursor((c) => setYear(c, y));
                        }
                      }
                    }}
                    onBlur={() => setYearText(String(cursor.getFullYear()))}
                    className="w-14 bg-transparent text-sm font-semibold text-secondary outline-none text-center rounded-md py-1 transition-colors duration-150 hover:bg-veil focus:bg-veil"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setCursor((c) => addMonths(c, 1))}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-secondary/60 transition-colors duration-150 hover:bg-veil hover:text-secondary cursor-pointer"
                  aria-label="Next month"
                >
                  <IconChevronRight size={16} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-xs text-secondary/40 uppercase">
                {weekdayLabels.map((wd, i) => (
                  <div key={i}>{wd}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {days.map((day) => {
                  const inMonth = isSameMonth(day, cursor);
                  const isSelected = selected && isSameDay(day, selected);
                  const isToday = isSameDay(day, new Date());
                  const disabledDay = isDisabled(day);

                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      disabled={disabledDay}
                      onClick={() => selectDay(day)}
                      className={`
                        aspect-square rounded-lg text-sm transition-colors duration-150
                        ${!inMonth ? "text-secondary/25" : "text-secondary/85"}
                        ${disabledDay ? "opacity-30 cursor-not-allowed" : "cursor-pointer hover:bg-veil-strong"}
                        ${isSelected ? "bg-main text-white hover:bg-main" : ""}
                        ${!isSelected && isToday ? "border border-main/50" : ""}
                      `}
                    >
                      {format(day, "d")}
                    </button>
                  );
                })}
              </div>
            </div>
          </Squircle>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );

  const Wrapper = (
    <div ref={wrapperRef} className="relative flex w-full font-main text-text">
      <Squircle asChild cornerRadius={10} cornerSmoothing={1}>
        <div
          className={`flex items-center w-full gap-2 pl-3.5 pr-2 border border-secondary/20 bg-container transition-colors duration-200 focus-within:border-main/60 ${disabled ? "opacity-50" : ""} ${className}`}
        >
          <input
            id={pickerId}
            type="text"
            inputMode="numeric"
            value={text}
            disabled={disabled}
            placeholder={placeholder || PLACEHOLDERS[lang]}
            onChange={(e) => handleTextChange(e.target.value)}
            onBlur={handleTextBlur}
            className="flex-1 w-full min-w-0 bg-transparent py-2 outline-none placeholder:text-secondary/40 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOpen((v) => !v)}
            aria-label="Open calendar"
            aria-haspopup="dialog"
            aria-expanded={open}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-secondary/50 transition-colors duration-150 hover:bg-veil-strong hover:text-secondary cursor-pointer disabled:cursor-not-allowed"
          >
            <IconCalendar size={16} />
          </button>
        </div>
      </Squircle>
      {panel}
    </div>
  );

  return label ? (
    <div className="flex flex-col gap-1">
      {Wrapper}
      <label className="-mt-1 mb-1 text-start text-sm text-text/50" htmlFor={pickerId}>
        {label}
      </label>
    </div>
  ) : (
    Wrapper
  );
}
