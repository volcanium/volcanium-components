import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useMemo,
  useId,
  ReactNode,
} from "react";
import { createPortal } from "react-dom";
import Button from "./Button";
import { IconSearch, IconSelector, IconX } from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "../../utils/useLanguage";
import { useClickOutside } from "../../utils/useDropdown";

export interface SelectOption<T = unknown> {
  label: ReactNode;
  /**
   * Plain-text match target used when `searchable` is set and the built-in
   * client-side filter is active. Falls back to `String(label)` when
   * omitted — set this explicitly when `label` is a non-text `ReactNode`.
   */
  searchText?: string;
  value: T;
}

export interface SelectProps<T = unknown> {
  options?: SelectOption<T>[];
  value?: T;
  onChange?: (value: T) => void;
  placeholder?: string;
  label?: ReactNode;
  id?: string;
  className?: string;
  /** Adds a search box to the dropdown — for option lists too long to scan by eye. */
  searchable?: boolean;
  /**
   * Called with the raw query on every keystroke — use this to filter
   * `options` server-side for large/live catalogues instead of the built-in
   * client-side filter. When provided, `options` is trusted as already
   * filtered and rendered as-is. Only relevant when `searchable` is set.
   */
  onSearchChange?: (query: string) => void;
  loading?: boolean;
  searchPlaceholder?: string;
  noResultsText?: ReactNode;
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

interface PanelPosition {
  left: number;
  width: number;
  top?: number;
  bottom?: number;
}

/**
 * A custom dropdown select. Pass `searchable` to add a search box to the
 * dropdown for option lists too long to scan by eye — filters `options`
 * client-side by default (accent-insensitive substring match), or pass
 * `onSearchChange` to drive the filtering yourself (e.g. a server-side
 * search) and hand back only the matching `options`.
 *
 * The dropdown panel renders through a portal into `document.body`,
 * positioned in `fixed` coordinates measured from the trigger — not
 * `position: absolute` nested under the trigger. A field used inside a
 * modal or any other container with its own scroll/overflow clips an
 * absolutely-positioned descendant at that container's edge, which would
 * cut the panel off mid-list; a portal sidesteps that entirely.
 */
export default function Select<T = unknown>({
  options = [],
  value,
  onChange,
  placeholder,
  label,
  id,
  className = "",
  searchable = false,
  onSearchChange,
  loading = false,
  searchPlaceholder,
  noResultsText,
}: SelectProps<T>) {
  const { t } = useLanguage();
  const actualPlaceholder = placeholder || t("select_placeholder");

  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<PanelPosition | null>(null);
  const [query, setQuery] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const generatedId = useId();
  const selectId = id || generatedId;
  const listboxId = `${selectId}-listbox`;

  useClickOutside(triggerRef, panelRef, () => setOpen(false));

  useLayoutEffect(() => {
    if (!open) return;
    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const margin = 8;
      const maxPanelHeight = 260;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const openUpward = spaceBelow < maxPanelHeight && spaceAbove > spaceBelow;
      setPosition(
        openUpward
          ? { left: rect.left, width: rect.width, bottom: window.innerHeight - rect.top + margin }
          : { left: rect.left, width: rect.width, top: rect.bottom + margin },
      );
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (open && searchable) {
      setQuery("");
      const frame = requestAnimationFrame(() => searchInputRef.current?.focus());
      return () => cancelAnimationFrame(frame);
    }
  }, [open, searchable]);

  const filtered = useMemo(() => {
    if (!searchable || onSearchChange) return options;
    if (!query.trim()) return options;
    const needle = normalize(query);
    return options.filter((o) => normalize(o.searchText ?? String(o.label)).includes(needle));
  }, [options, query, searchable, onSearchChange]);

  const handleQueryChange = (next: string) => {
    setQuery(next);
    onSearchChange?.(next);
  };

  const visibleOptions = searchable ? filtered : options;
  const selected = options.find((o) => o.value === value);

  // `variant` no longer changes the trigger's look — a `Select` with a
  // `label` must render pixel-for-pixel like a bare one, so both go through
  // the exact same `Button` (same padding, squircle, hover scale, colors).
  const TriggerElement = (
    <Button
      ref={triggerRef}
      id={selectId}
      variant="tertiary"
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={listboxId}
      onClick={() => setOpen(!open)}
      className={`w-52 px-3! justify-between! bg-secondary/10 border border-secondary/20 text-start text-secondary hover:bg-accent/15 hover:border-accent/50 focus:bg-accent/15 relative ${className}`}
    >
      <span className={`${selected ? "" : "opacity-60"}`}>
        {selected ? selected.label : actualPlaceholder}
      </span>
      <span
        className={`absolute right-2 text-secondary/70 transition-transform duration-300 ${open ? "scale-0" : "scale-100"}`}
      >
        <IconSelector />
      </span>
      <span
        className={`absolute right-2 text-accent transition-transform duration-300 ${open ? "scale-100" : "scale-0"}`}
      >
        <IconX />
      </span>
    </Button>
  );

  const panel = createPortal(
    <AnimatePresence>
      {open && position && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: position.bottom !== undefined ? 5 : -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: position.bottom !== undefined ? 5 : -5 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          style={{
            position: "fixed",
            left: position.left,
            width: Math.max(position.width, 208),
            top: position.top,
            bottom: position.bottom,
          }}
          className="z-999 font-main text-text"
        >
          <div className="bg-container rounded-xl shadow-2xl border border-secondary/10 backdrop-blur flex flex-col overflow-hidden">
            {searchable && (
              <div className="flex items-center gap-2 px-3 py-2 border-b border-secondary/10 shrink-0 focus-within:border-accent/60">
                <IconSearch size={16} className="text-secondary/50 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  placeholder={searchPlaceholder || t("select_search_placeholder")}
                  className="flex-1 bg-transparent outline-0 text-sm min-w-0"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            <div
              id={listboxId}
              role="listbox"
              className="p-2 flex flex-col gap-1 max-h-60 overflow-y-auto"
            >
              {searchable && loading ? (
                <div className="px-3 py-2 text-sm opacity-50">{t("select_loading")}</div>
              ) : searchable && visibleOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm opacity-50">
                  {noResultsText ?? t("select_no_results")}
                </div>
              ) : (
                <AnimatePresence>
                  {visibleOptions.map((opt, i) => (
                    <motion.button
                      key={i}
                      type="button"
                      role="option"
                      aria-selected={value === opt.value}
                      onClick={() => {
                        onChange?.(opt.value);
                        setOpen(false);
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      className={`
                        px-3 py-2 rounded-lg text-left text-sm transition-all duration-150 truncate shrink-0
                        hover:bg-accent/25 hover:text-secondary hover:scale-[1.02]
                        ${value === opt.value ? "bg-accent/40 text-secondary" : "bg-transparent"}
                      `}
                    >
                      {opt.label}
                    </motion.button>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );

  const SelectWrapper = (
    <div className="relative inline-block font-main text-text">
      {TriggerElement}
      {panel}
    </div>
  );

  return label ? (
    <div className="flex flex-col gap-1">
      {SelectWrapper}
      <label className="-mt-1 mb-1 text-start text-sm text-white/50" htmlFor={selectId}>
        {label}
      </label>
    </div>
  ) : (
    SelectWrapper
  );
}
