import { Fragment } from "react";
import clsx from "clsx";
import { IconChevronRight } from "@tabler/icons-react";

export interface BreadcrumbItem {
  id: string;
  label: string;
}

export interface BreadcrumbProps {
  /** Chemin depuis la racine (la racine elle-même n'en fait pas partie : voir `rootLabel`). */
  items: BreadcrumbItem[];
  /** Nom de la racine (ex. « Mon Drive »). */
  rootLabel: string;
  /** `id` du maillon cliqué, `null` pour la racine. Le dernier maillon (page courante) n'est pas cliquable. */
  onNavigate: (id: string | null) => void;
  /** Nom accessible de la navigation. @default "Fil d'Ariane" */
  ariaLabel?: string;
  className?: string;
}

/** Fil d'Ariane d'une arborescence (dossiers). Au-delà de 4 niveaux, les niveaux du milieu sont repliés en « … ». */
export default function Breadcrumb({ items, rootLabel, onNavigate, ariaLabel = "Fil d'Ariane", className }: BreadcrumbProps) {
  const all: { id: string | null; label: string }[] = [{ id: null, label: rootLabel }, ...items];
  const shown = all.length > 4 ? [all[0]!, null, ...all.slice(-2)] : all;
  return (
    <nav aria-label={ariaLabel} className={clsx("min-w-0", className)}>
      <ol className="flex min-w-0 items-center gap-1 text-sm">
        {shown.map((it, i) => {
          const last = i === shown.length - 1;
          return (
            <Fragment key={it ? (it.id ?? "root") : "gap"}>
              {i > 0 && <IconChevronRight size={14} aria-hidden="true" className="shrink-0 opacity-40" />}
              <li className={clsx("min-w-0", last ? "font-medium" : "shrink-0")}>
                {it === null ? <span aria-hidden="true" className="opacity-50">…</span> : last
                  ? <span aria-current="page" className="block truncate">{it.label}</span>
                  : <button type="button" onClick={() => onNavigate(it.id)} className="max-w-[12rem] cursor-pointer truncate rounded px-1 opacity-70 hover:bg-vc-line/40 hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-vc-main">{it.label}</button>}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
