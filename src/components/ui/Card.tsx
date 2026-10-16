import { ReactNode } from "react";
import clsx from "clsx";
import Title from "./Title";

export interface CardProps {
  /** Titre de la carte. */
  title?: string;
  /** Phrase d'explication sous le titre. */
  description?: ReactNode;
  /** Boutons alignés à droite du titre. */
  actions?: ReactNode;
  /** Marge intérieure réduite, pour les cartes répétées dans une liste. @default false */
  compact?: boolean;
  /** Balise rendue : `section` par défaut, `li` dans une liste, `article` pour un contenu autonome. @default "section" */
  as?: "section" | "article" | "li" | "div";
  children?: ReactNode;
  className?: string;
}

/** Carte de regroupement : une seule recette de bordure / fond pour toute l'application. */
export default function Card({ title, description, actions, compact, as: Tag = "section", children, className }: CardProps) {
  return (
    <Tag className={clsx("rounded-lg border border-vc-line bg-vc-veil space-y-3", compact ? "p-4" : "p-5", className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-3">
          {title && <Title level="sm">{title}</Title>}
          {actions}
        </div>
      )}
      {description && <p className="text-sm text-vc-text/70">{description}</p>}
      {children}
    </Tag>
  );
}
