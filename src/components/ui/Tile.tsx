import { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

export interface TileProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "title" | "role" | "aria-checked"> {
  /** Titre de la tuile. */
  title: ReactNode;
  /** Détail sous le titre. */
  description?: ReactNode;
  /** Icône ou pastille à gauche. */
  icon?: ReactNode;
  /** Élément à droite (prix, flèche, badge). */
  trailing?: ReactNode;
  /**
   * Tuile « choix » (un parmi plusieurs, façon bouton radio) : `selected` la met en évidence et expose `aria-pressed`.
   * Laisser `undefined` pour une simple tuile cliquable (choix d'un compte, ouverture d'une page).
   */
  selected?: boolean;
}

/** Grande zone cliquable (choix d'un compte, d'une offre, d'un fournisseur) : un vrai `<button>`, focus et clavier inclus. */
export default function Tile({ title, description, icon, trailing, selected, className, type = "button", ...props }: TileProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={clsx(
        "flex w-full cursor-pointer items-center gap-3 rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vc-main/50 disabled:cursor-not-allowed disabled:opacity-50",
        selected ? "border-vc-main/60 bg-vc-veil-strong" : "border-vc-line bg-vc-veil hover:border-vc-line-strong hover:bg-vc-veil-strong",
        className,
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{title}</span>
        {description && <span className="block text-xs text-vc-text/60">{description}</span>}
      </span>
      {trailing && <span className="shrink-0">{trailing}</span>}
    </button>
  );
}
