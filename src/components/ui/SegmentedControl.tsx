import { ReactNode } from "react";
import clsx from "clsx";

export interface SegmentedOption<V extends string | number> {
  value: V;
  label: ReactNode;
}

export interface SegmentedControlProps<V extends string | number> {
  options: SegmentedOption<V>[];
  value: V;
  onChange: (value: V) => void;
  /** Nom accessible du groupe (ex. « Période affichée »). */
  label: string;
  className?: string;
}

/** Choix d'une valeur parmi quelques-unes, en boutons côte à côte (période, vue, filtre). */
export default function SegmentedControl<V extends string | number>({ options, value, onChange, label, className }: SegmentedControlProps<V>) {
  return (
    <div className={clsx("flex gap-1 max-sm:flex-wrap", className)} role="group" aria-label={label}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={clsx(
              "cursor-pointer rounded-md border px-2.5 py-1 max-sm:min-h-10 max-sm:px-3.5 max-sm:text-sm text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vc-main/50",
              active ? "border-vc-text/40 bg-vc-veil-strong" : "border-vc-line-strong opacity-70 hover:opacity-100",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
