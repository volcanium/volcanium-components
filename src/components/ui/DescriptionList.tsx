import { ReactNode } from "react";
import clsx from "clsx";

export interface DescriptionItem {
  label: ReactNode;
  value: ReactNode;
}

export interface DescriptionListProps {
  items: DescriptionItem[];
  /** Largeur de la colonne des libellés. @default "180px" */
  labelWidth?: string;
  className?: string;
}

/** Liste « libellé : valeur » sur deux colonnes (réglages, fiche récapitulative). */
export default function DescriptionList({ items, labelWidth = "180px", className }: DescriptionListProps) {
  return (
    <dl className={clsx("grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[var(--vc-dl-label)_1fr]", className)} style={{ ["--vc-dl-label" as string]: labelWidth }}>
      {items.map((it, i) => (
        <div key={i} className="contents">
          <dt className="opacity-60">{it.label}</dt>
          <dd>{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
