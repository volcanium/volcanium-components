import { ReactNode, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Squircle } from "@squircle-js/react";
import { IconChevronDown, IconChevronRight, IconPencil, IconRefresh } from "@tabler/icons-react";
import OptionsMenu, { OptionsMenuOption } from "./OptionsMenu";

/**
 * A labeled value row — a small caption above a value.
 *
 * Three independent modes, picked by which props are set:
 * - `options` — clicking the row opens an inline dropdown right there (the
 *   same `OptionsMenu` panel `Select` uses, with its own minimal trigger —
 *   not a nested `Select`, which is its own boxed field and not meant to be
 *   worn as someone else's skin).
 * - `editable` — clicking the row turns the value into a plain, invisible
 *   text input right in place; Enter/blur commits via `onSave`.
 * - `onClick` (neither of the above) — the original "do something external"
 *   button, for actions that genuinely need their own modal/flow (delete,
 *   copy, navigate...).
 *
 * Purely presentational otherwise: formatting (dates, colored status text,
 * etc.) stays the caller's job.
 */
export interface InformationButtonProps {
  /** Small caption shown above the value. */
  label: ReactNode;
  /** The value to display — for `options` mode, the currently selected option's raw value. */
  value?: ReactNode;
  /** Shown instead of `value` when it's empty/undefined/null. */
  placeholder?: ReactNode;
  /** Called on click. Ignored when `editable` or `options` is set. */
  onClick?: () => void;
  /** Disables interaction without hiding the row (e.g. a locked field). */
  disabled?: boolean;
  className?: string;

  /** Turns the row into an inline text field on click. */
  editable?: boolean;
  /** Native `<input>` type for the inline field (defaults to `"text"`). */
  inputType?: string;
  /** Raw string edited in the inline field — defaults to `String(value)`. */
  editValue?: string;
  /** Called with the new value on commit (Enter or blur), only if it changed. May return a promise — a small sync icon shows next to the label while it's pending. */
  onSave?: (newValue: string) => void | Promise<void>;

  /** Turns the row into an inline dropdown on click. `value` must match one of these options' `value`. */
  options?: OptionsMenuOption[];
  /** Called with the picked option's value. May return a promise — a small sync icon shows next to the label while it's pending. */
  onChange?: (value: unknown) => void | Promise<void>;
}

export function InformationButton({
  label,
  value,
  placeholder,
  onClick,
  disabled = false,
  className,
  editable = false,
  inputType = "text",
  editValue,
  onSave,
  options,
  onChange,
}: InformationButtonProps) {
  const isSelectMode = Boolean(options);
  const isTextEditMode = editable && !isSelectMode;
  const isInteractive = !disabled && (isSelectMode || isTextEditMode || Boolean(onClick));

  const [selectOpen, setSelectOpen] = useState(false);
  const [textEditing, setTextEditing] = useState(false);
  const [draft, setDraft] = useState(() => editValue ?? (value != null ? String(value) : ""));
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // While a save/change is in flight: shows the just-picked value right away
  // (no reverting to the old one first) plus a small syncing icon next to
  // the label — instead of the row flashing old-value -> new-value once the
  // server round-trip resolves.
  const [pending, setPending] = useState(false);
  const [pendingDisplay, setPendingDisplay] = useState<ReactNode>(null);

  useEffect(() => {
    if (!textEditing) return;
    setDraft(editValue ?? (value != null ? String(value) : ""));
    const frame = requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      el.focus();
      // Only text-like input types support `setSelectionRange` — "email",
      // "number", etc. throw synchronously if called on them.
      try {
        const end = el.value.length;
        el.setSelectionRange(end, end);
      } catch {
        // Cursor just lands wherever focus() put it — fine for these types.
      }
    });
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textEditing]);

  const commitText = async () => {
    const original = editValue ?? (value != null ? String(value) : "");
    setTextEditing(false);
    if (draft === original) return;
    setPendingDisplay(draft);
    setPending(true);
    try {
      await onSave?.(draft);
    } finally {
      setPending(false);
      setPendingDisplay(null);
    }
  };

  const selected = options?.find((o) => o.value === value);

  const handleSelectPick = async (picked: unknown) => {
    setSelectOpen(false);
    const pickedOption = options?.find((o) => o.value === picked);
    setPendingDisplay(pickedOption?.label ?? String(picked));
    setPending(true);
    try {
      await onChange?.(picked);
    } finally {
      setPending(false);
      setPendingDisplay(null);
    }
  };

  const baseClassName = clsx(
    "flex w-full flex-1 items-center gap-3 text-left py-2.5 px-4 bg-vc-back border border-vc-line transition-all duration-300 ease-out",
    className,
  );

  const labelRow = (
    <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-vc-secondary/55">
      {label}
      {pending && <IconRefresh size={12} className="animate-spin text-vc-main/90" />}
    </span>
  );

  const displayValue = pending ? pendingDisplay : isSelectMode ? (selected?.label ?? value) : value;

  const valueDisplay = (
    <span
      className={clsx(
        "text-base font-medium truncate w-full",
        displayValue == null && placeholder ? "text-vc-secondary/50 italic" : "text-vc-secondary",
      )}
    >
      {displayValue ?? placeholder}
    </span>
  );

  const content = (
    <div className="flex flex-1 min-w-0 flex-col items-start gap-0.5">
      {labelRow}

      {isTextEditMode && textEditing ? (
        <input
          ref={inputRef}
          type={inputType}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitText}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitText();
            } else if (e.key === "Escape") {
              e.preventDefault();
              setTextEditing(false);
            }
          }}
          className="w-full bg-transparent p-0 border-0 outline-none text-base font-medium text-vc-secondary shadow-[inset_0_-1px_0_0_color-mix(in_srgb,var(--color-vc-main)_28%,transparent)]"
        />
      ) : (
        valueDisplay
      )}
    </div>
  );

  const chevron = !disabled && (
    <IconChevronRight className="w-4 h-4 shrink-0 text-vc-secondary/30 transition-transform duration-300 ease-out group-hover:translate-x-0.5" />
  );

  const pencil = !disabled && !textEditing && (
    <IconPencil className="w-4 h-4 shrink-0 text-vc-secondary/30 transition-transform duration-300 ease-out group-hover:scale-110" />
  );

  if (!isInteractive) {
    return (
      <Squircle cornerRadius={9} cornerSmoothing={1} asChild>
        <div className={clsx(baseClassName, disabled && "opacity-60")}>{content}</div>
      </Squircle>
    );
  }

  const interactiveClassName = clsx(
    "group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vc-main/50",
    disabled
      ? "opacity-60 cursor-not-allowed"
      : "cursor-pointer hover:bg-vc-info-hover hover:border-vc-line-strong active:scale-[0.99] active:duration-150",
  );

  // Select mode: this row IS the trigger (own ref, own minimal affordance
  // icon) — `OptionsMenu` only owns the panel, so nothing here needs to fake
  // another component's box styling. A native `<button>` can't legally nest
  // a focusable descendant, and a portal-rendered panel counts once it's
  // open, so this stays a `div[role=button]` throughout.
  if (isSelectMode) {
    return (
      <Squircle cornerRadius={9} cornerSmoothing={1} asChild>
        <div
          ref={triggerRef}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={selectOpen}
          onClick={disabled ? undefined : () => setSelectOpen((v) => !v)}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setSelectOpen((v) => !v);
            }
          }}
          className={clsx(baseClassName, interactiveClassName)}
        >
          {content}
          {!disabled && (
            <IconChevronDown
              size={16}
              className={clsx(
                "shrink-0 text-vc-secondary/40 transition-transform duration-200 ease-out",
                selectOpen && "rotate-180",
              )}
            />
          )}
          <OptionsMenu
            triggerRef={triggerRef}
            open={selectOpen}
            onClose={() => setSelectOpen(false)}
            options={options ?? []}
            value={value}
            onChange={handleSelectPick}
          />
        </div>
      </Squircle>
    );
  }

  // Inline text-edit mode: before editing starts there's no nested control
  // yet, so the whole row is a click/keyboard target that starts it — same
  // nesting concern as above rules out a native `<button>` here too, since
  // it becomes a `<div>` containing a focusable `<input>` once editing.
  if (isTextEditMode) {
    return (
      <Squircle cornerRadius={9} cornerSmoothing={1} asChild>
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          onClick={disabled || textEditing ? undefined : () => setTextEditing(true)}
          onKeyDown={(e) => {
            if (disabled || textEditing) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setTextEditing(true);
            }
          }}
          className={clsx(baseClassName, interactiveClassName)}
        >
          {content}
          {pencil}
        </div>
      </Squircle>
    );
  }

  return (
    <Squircle cornerRadius={9} cornerSmoothing={1} asChild>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={clsx(baseClassName, interactiveClassName)}
      >
        {content}
        {chevron}
      </button>
    </Squircle>
  );
}

export default InformationButton;
