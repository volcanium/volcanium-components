import { ReactNode } from "react";
import clsx from "clsx";

export interface BarStripItem {
  key: string;
  /** Classes de couleur du bloc (ex. `bg-vc-success`). */
  color: string;
  /** Titre en gras de l'info-bulle (ex. la date). */
  title: ReactNode;
  /** Lignes de détail de l'info-bulle. */
  lines: string[];
  /** Phrase lue par les lecteurs d'écran pour ce bloc. */
  ariaLabel: string;
}

export interface BarStripProps {
  items: BarStripItem[];
  /** Nom accessible de toute la bande. */
  label: string;
  /** Hauteur des blocs. @default "h-8" */
  heightClass?: string;
  /** Espace entre les blocs. @default "gap-0.5" */
  gapClass?: string;
  /** Largeur minimale d'un bloc. @default "min-w-[5px]" */
  minWidthClass?: string;
  className?: string;
}

/**
 * Frise de petits blocs colorés (une barre par heure ou par jour), chacun avec une info-bulle au survol ou au focus.
 * Les 4 premiers et 4 derniers blocs accrochent leur info-bulle à leur bord pour qu'elle ne sorte pas de la carte.
 */
export default function BarStrip({ items, label, heightClass = "h-8", gapClass = "gap-0.5", minWidthClass = "min-w-[5px]", className }: BarStripProps) {
  return (
    <div className={clsx("flex w-full", gapClass, className)} role="group" aria-label={label}>
      {items.map((it, i) => {
        const place = i < 4 ? "left-0" : i >= items.length - 4 ? "right-0" : "left-1/2 -translate-x-1/2";
        return (
          <span key={it.key} className="group relative flex-1" tabIndex={0} aria-label={it.ariaLabel}>
            <span className={clsx("block w-full rounded-sm transition-transform group-hover:scale-y-110 group-focus:scale-y-110", heightClass, minWidthClass, it.color)} />
            <span
              role="tooltip"
              className={clsx(
                "pointer-events-none absolute bottom-full z-20 mb-2 hidden w-max max-w-[240px] rounded-md border border-vc-line bg-vc-container px-3 py-2 text-left text-xs shadow-lg group-hover:block group-focus:block",
                place,
              )}
            >
              <span className="block font-medium first-letter:uppercase">{it.title}</span>
              {it.lines.map((l, k) => (
                <span key={k} className="block opacity-80">
                  {l}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </div>
  );
}
