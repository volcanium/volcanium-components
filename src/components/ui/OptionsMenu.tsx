import { useState, useRef, useEffect, useLayoutEffect, useMemo, RefObject, ReactNode } from "react";
import { createPortal } from "react-dom";
import { IconSearch } from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "../../utils/useLanguage";
import { useClickOutside } from "../../utils/useDropdown";

export interface OptionsMenuOption<T = unknown> {
  label: ReactNode;
  /**
   * Plain-text match target used when `searchable` is set and the built-in
   * client-side filter is active. Falls back to `String(label)` when
   * omitted — set this explicitly when `label` is a non-text `ReactNode`.
   */
  searchText?: string;
  value: T;
}

interface PanelPosition {
  left: number;
  width: number;
  top?: number;
  bottom?: number;
}

export interface OptionsMenuProps<T = unknown> {
  /** The element the panel is anchored to and positioned against. */
  triggerRef: RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  options: OptionsMenuOption<T>[];
  value?: T;
  onChange?: (value: T) => void;
  searchable?: boolean;
  onSearchChange?: (query: string) => void;
  loading?: boolean;
  searchPlaceholder?: string;
  noResultsText?: ReactNode;
  listboxId?: string;
  /** Minimum panel width in px (it never shrinks below the trigger's own width either). */
  minWidth?: number;
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * The portal-rendered dropdown panel shared by `Select` and
 * `InformationButton`'s inline select mode — positioning, search-filtering,
 * click-outside-to-close and option rendering live here exactly once, so
 * neither consumer has to fake the other's trigger styling to reuse it.
 * Each consumer owns and renders its own trigger; this only owns the panel.
 */
export default function OptionsMenu<T = unknown>({
  triggerRef,
  open,
  onClose,
  options,
  value,
  onChange,
  searchable = false,
  onSearchChange,
  loading = false,
  searchPlaceholder,
  noResultsText,
  listboxId,
  minWidth = 208,
}: OptionsMenuProps<T>) {
  const { t } = useLanguage();
  const [position, setPosition] = useState<PanelPosition | null>(null);
  const [query, setQuery] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useClickOutside(triggerRef, panelRef, onClose);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return createPortal(
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
            width: Math.max(position.width, minWidth),
            top: position.top,
            bottom: position.bottom,
          }}
          className="z-999 font-vc-main text-vc-text"
        >
          <div className="bg-vc-container rounded-xl shadow-[0_16px_40px_-16px_rgba(0,0,0,0.55)] border border-vc-line backdrop-blur flex flex-col overflow-hidden">
            {searchable && (
              <div className="flex items-center gap-2 px-3 py-2 border-b border-vc-line shrink-0 focus-within:border-vc-main/40 transition-colors duration-200">
                <IconSearch size={16} className="text-vc-secondary/50 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  placeholder={searchPlaceholder || t("select_search_placeholder")}
                  className="flex-1 bg-transparent outline-0 text-sm min-w-0 placeholder:text-vc-secondary/40"
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
                      onClick={(e) => {
                        // Stop here: this panel is rendered through a portal,
                        // but React still bubbles synthetic events along the
                        // *component* tree, not the DOM tree — so this click
                        // would otherwise reach a consumer that nests
                        // `OptionsMenu` inside its own clickable trigger
                        // (`InformationButton`'s inline select mode) and
                        // re-toggle it right back open.
                        e.stopPropagation();
                        onChange?.(opt.value);
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      className={`
                        px-3 py-2 rounded-lg text-left text-sm transition-colors duration-150 truncate shrink-0
                        hover:bg-vc-veil hover:text-vc-secondary
                        ${value === opt.value ? "bg-vc-veil-strong text-vc-secondary" : "bg-transparent text-vc-secondary/80"}
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
}
