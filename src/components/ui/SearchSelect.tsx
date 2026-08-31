import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useMemo,
  useId,
  ReactNode,
} from "react";
import { IconSearch, IconSelector, IconX } from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "../../utils/useLanguage";

export interface SearchSelectOption {
  /** Plain string, not a `ReactNode` — unlike `Select`, this is what the search actually matches against. */
  label: string;
  value: any;
}

export interface SearchSelectProps {
  options?: SearchSelectOption[];
  value?: any;
  onChange?: (value: any) => void;
  /**
   * Called with the raw query on every keystroke — use this to filter
   * `options` server-side for large/live catalogues instead of the built-in
   * client-side filter. When provided, `options` is trusted as already
   * filtered and rendered as-is.
   */
  onSearchChange?: (query: string) => void;
  loading?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  noResultsText?: ReactNode;
  label?: ReactNode;
  id?: string;
  variant?: "default" | "one" | "secondary";
  className?: string;
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * A `Select` with a search box in the dropdown — for option lists too long
 * to scan by eye (a full station catalogue, a user directory, ...). Filters
 * `options` client-side by default (accent-insensitive substring match on
 * `label`); pass `onSearchChange` to instead drive the filtering yourself
 * (e.g. a server-side search) and hand back only the matching `options`.
 */
export default function SearchSelect({
  options = [],
  value,
  onChange,
  onSearchChange,
  loading = false,
  placeholder,
  searchPlaceholder,
  noResultsText,
  label,
  id,
  variant = "default",
  className = "",
}: SearchSelectProps) {
  const { t } = useLanguage();
  const actualPlaceholder = placeholder || t("select_placeholder");

  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const generatedId = useId();
  const selectId = id || generatedId;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  useLayoutEffect(() => {
    const updatePosition = () => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setOpenUpward(spaceBelow < 260 && spaceAbove > spaceBelow);
    };
    updatePosition();
    setReady(true);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const updatePosition = () => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setOpenUpward(spaceBelow < 260 && spaceAbove > spaceBelow);
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
    if (open) {
      setQuery("");
      const frame = requestAnimationFrame(() => searchInputRef.current?.focus());
      return () => cancelAnimationFrame(frame);
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (onSearchChange) return options;
    if (!query.trim()) return options;
    const needle = normalize(query);
    return options.filter((o) => normalize(o.label).includes(needle));
  }, [options, query, onSearchChange]);

  const handleQueryChange = (next: string) => {
    setQuery(next);
    onSearchChange?.(next);
  };

  const selected = options.find((o) => o.value === value);

  const isInputVariant = variant === "one" || variant === "secondary";
  const inputBg = variant === "secondary" ? "bg-contaner" : "bg-back";

  const TriggerElement = isInputVariant ? (
    <button
      id={selectId}
      type="button"
      onClick={() => setOpen(!open)}
      className={`p-2 ${inputBg} flex flex-1 rounded-lg px-10 outline-0 justify-between items-center relative ${className}`}
    >
      <span className={`truncate ${selected ? "" : "opacity-50"}`}>
        {selected ? selected.label : actualPlaceholder}
      </span>
      <span className="flex items-center justify-center opacity-50 shrink-0">
        <IconSelector size={18} />
      </span>
    </button>
  ) : (
    <button
      id={selectId}
      type="button"
      onClick={() => setOpen(!open)}
      className={`min-w-52 p-2 px-4 rounded-lg bg-secondary/20 hover:bg-main focus:bg-main transition flex items-center justify-between gap-2 relative ${className}`}
    >
      <span className={`truncate ${selected ? "" : "opacity-60"}`}>
        {selected ? selected.label : actualPlaceholder}
      </span>
      <span
        className={`shrink-0 transition-transform duration-300 ${open ? "scale-0" : "scale-100"}`}
      >
        <IconSelector size={18} />
      </span>
      <span
        className={`absolute right-4 transition-transform duration-300 ${open ? "scale-100" : "scale-0"}`}
      >
        <IconX size={18} />
      </span>
    </button>
  );

  const SelectWrapper = (
    <div ref={ref} className="relative inline-block font-main text-text w-full">
      {TriggerElement}

      <AnimatePresence>
        {open && ready && (
          <motion.div
            initial={{ opacity: 0, y: openUpward ? 5 : -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: openUpward ? 5 : -5 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className={`absolute left-0 w-full min-w-64 z-50
              ${openUpward ? "bottom-full mb-2 origin-bottom" : "top-full mt-2 origin-top"}
            `}
          >
            <div className="bg-contaner rounded-xl shadow-2xl border border-overlay/10 backdrop-blur flex flex-col overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-overlay/10 shrink-0">
                <IconSearch size={16} className="opacity-50 shrink-0" />
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
              <div className="p-2 flex flex-col gap-1 max-h-60 overflow-y-auto">
                {loading ? (
                  <div className="px-3 py-2 text-sm opacity-50">{t("select_loading")}</div>
                ) : filtered.length === 0 ? (
                  <div className="px-3 py-2 text-sm opacity-50">
                    {noResultsText ?? t("select_no_results")}
                  </div>
                ) : (
                  filtered.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange?.(opt.value);
                        setOpen(false);
                      }}
                      className={`
                        px-3 py-2 rounded-lg text-left text-sm transition-all duration-150 truncate
                        hover:bg-main hover:scale-[1.02]
                        ${value === opt.value ? "bg-main/80" : "bg-transparent"}
                      `}
                    >
                      {opt.label}
                    </button>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
