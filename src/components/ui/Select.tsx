import { useState, useRef, useId, ReactNode } from "react";
import Button from "./Button";
import { IconSelector, IconX } from "@tabler/icons-react";
import { useLanguage } from "../../utils/useLanguage";
import OptionsMenu, { OptionsMenuOption } from "./OptionsMenu";

export type SelectOption<T = unknown> = OptionsMenuOption<T>;

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
  /** Controls the dropdown open state externally. Omit for normal uncontrolled use. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * A custom dropdown select. Pass `searchable` to add a search box to the
 * dropdown for option lists too long to scan by eye — filters `options`
 * client-side by default (accent-insensitive substring match), or pass
 * `onSearchChange` to drive the filtering yourself (e.g. a server-side
 * search) and hand back only the matching `options`.
 *
 * The dropdown panel itself is `OptionsMenu` (shared with
 * `InformationButton`'s inline select mode) — this component only owns the
 * boxed trigger button and label.
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
  open: controlledOpen,
  onOpenChange,
}: SelectProps<T>) {
  const { t } = useLanguage();
  const actualPlaceholder = placeholder || t("select_placeholder");

  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = (next: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };
  const triggerRef = useRef<HTMLButtonElement>(null);

  const generatedId = useId();
  const selectId = id || generatedId;
  const listboxId = `${selectId}-listbox`;

  const selected = options.find((o) => o.value === value);

  // `variant` no longer changes the trigger's look — a `Select` with a
  // `label` must render pixel-for-pixel like a bare one, so both go through
  // the exact same `Button` (same padding, squircle, hover scale, colors).
  const TriggerElement = (
    <Button
      ref={triggerRef}
      id={selectId}
      // Sans `type="button"`, un Select dans un <form> (ex. `Form`) soumettait le formulaire a l'ouverture.
      type="button"
      variant="tertiary"
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={listboxId}
      onClick={() => setOpen(!open)}
      className={`w-fit min-w-52 max-w-full px-3.5! justify-between! bg-vc-container border border-vc-line-strong text-start text-vc-secondary transition-colors duration-200 hover:border-vc-text/30 focus-visible:border-vc-main/60 relative ${open ? "border-vc-main/60!" : ""} ${className}`}
    >
      <span className={`min-w-0 truncate pr-5 ${selected ? "" : "text-vc-secondary/40"}`}>
        {selected ? selected.label : actualPlaceholder}
      </span>
      <span
        className={`absolute right-3 text-vc-secondary/50 transition-transform duration-200 ease-out ${open ? "scale-0" : "scale-100"}`}
      >
        <IconSelector size={16} />
      </span>
      <span
        className={`absolute right-3 text-vc-main transition-transform duration-200 ease-out ${open ? "scale-100" : "scale-0"}`}
      >
        <IconX size={16} />
      </span>
    </Button>
  );

  const SelectWrapper = (
    <div className="relative inline-block font-vc-main text-vc-text">
      {TriggerElement}
      <OptionsMenu
        triggerRef={triggerRef}
        open={open}
        onClose={() => setOpen(false)}
        options={options}
        value={value}
        onChange={(v) => {
          onChange?.(v);
          setOpen(false);
        }}
        searchable={searchable}
        onSearchChange={onSearchChange}
        loading={loading}
        searchPlaceholder={searchPlaceholder}
        noResultsText={noResultsText}
        listboxId={listboxId}
      />
    </div>
  );

  return label ? (
    <div className="flex flex-col gap-1">
      {SelectWrapper}
      <label className="-mt-1 mb-1 text-start text-sm text-vc-text/50" htmlFor={selectId}>
        {label}
      </label>
    </div>
  ) : (
    SelectWrapper
  );
}
