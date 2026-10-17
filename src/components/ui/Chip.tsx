import { ReactNode } from "react";
import clsx from "clsx";
import { IconX } from "@tabler/icons-react";

export interface ChipProps {
  children: ReactNode;
  /** Affiche une croix et l'appelle au clic : l'élément est supprimable. */
  onRemove?: () => void;
  /** Nom accessible de la croix (ex. « Retirer example.com »). Obligatoire avec `onRemove`. */
  removeLabel?: string;
  className?: string;
}

/** Petite pastille pour une valeur d'une liste (domaine, étiquette, adresse), avec une croix pour la retirer. */
export default function Chip({ children, onRemove, removeLabel, className }: ChipProps) {
  return (
    <span className={clsx("inline-flex items-center gap-1 rounded-md border border-vc-line-strong bg-vc-veil px-2 py-0.5 text-sm", className)}>
      {children}
      {onRemove && (
        <button
          type="button"
          aria-label={removeLabel}
          title={removeLabel}
          onClick={onRemove}
          className="inline-flex h-4 w-4 cursor-pointer items-center justify-center rounded-sm opacity-60 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vc-main/50"
        >
          <IconX size={12} />
        </button>
      )}
    </span>
  );
}
