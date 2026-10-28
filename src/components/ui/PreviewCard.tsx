import type { ReactNode } from "react";
import clsx from "clsx";

export interface PreviewCardProps {
  /** Titre (tronqué sur une ligne). */
  title: string;
  /** Ligne de détail sous le titre (auteur, date de modification…). */
  subtitle?: ReactNode;
  /** Aperçu de l'élément ; absent, ou s'il ne charge pas, `placeholder` s'affiche. */
  image?: string | null;
  /** Contenu affiché quand il n'y a pas d'aperçu (icône, texte « Vide »…). */
  placeholder?: ReactNode;
  /** Pastilles posées sur le coin haut gauche de l'aperçu (partagé, lecture seule…). */
  badges?: ReactNode;
  /** Actions du coin haut droit (menu « … »). Elles ne déclenchent PAS `onOpen`. */
  menu?: ReactNode;
  /** Ouvre l'élément. */
  onOpen: () => void;
  /** Texte lu pour le bouton d'ouverture. @default title */
  openLabel?: string;
  className?: string;
}

/** Carte à vignette : liste de documents (tableaux, fichiers, maquettes) avec un aperçu de leur contenu. Rapport 16/10 fixe, pas de saut de mise en page au chargement. */
export default function PreviewCard({ title, subtitle, image, placeholder, badges, menu, onOpen, openLabel, className }: PreviewCardProps) {
  return (
    <div className={clsx("group relative overflow-hidden rounded-lg border border-vc-line bg-vc-container transition-colors focus-within:border-vc-main/60 hover:border-vc-line-strong", className)}>
      <button type="button" onClick={onOpen} aria-label={openLabel ?? title} className="block w-full cursor-pointer text-left focus-visible:outline-none">
        <span className="relative block aspect-[16/10] w-full overflow-hidden bg-vc-back">
          {image ? (
            // Les aperçus sont des PNG à fond opaque : on les affiche entiers, sans rogner.
            <img src={image} alt="" loading="lazy" className="h-full w-full object-contain" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-vc-text/40">{placeholder}</span>
          )}
        </span>
        <span className="block px-3 pb-3 pt-2.5">
          <span className="block truncate text-sm font-medium">{title}</span>
          {subtitle && <span className="mt-0.5 block truncate text-xs text-vc-text/60">{subtitle}</span>}
        </span>
      </button>
      {badges && <div className="pointer-events-none absolute left-2 top-2 flex flex-wrap gap-1">{badges}</div>}
      {menu && <div className="absolute right-1.5 top-1.5 opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">{menu}</div>}
    </div>
  );
}
