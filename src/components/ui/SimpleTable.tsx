import { ReactNode } from "react";
import clsx from "clsx";

export interface SimpleTableColumn<Row> {
  key: string;
  /** En-tête de colonne. */
  header: ReactNode;
  /** Contenu de la cellule. */
  render: (row: Row, index: number) => ReactNode;
  /** Cache l'en-tête visuellement mais le garde pour les lecteurs d'écran (colonne d'actions, icônes). */
  srOnlyHeader?: boolean;
  /** Alignement du texte. @default "left" */
  align?: "left" | "right";
  /** Classes de la cellule (ex. `break-all`, `whitespace-nowrap`). */
  className?: string;
  /** Première colonne = en-tête de ligne (`<th scope="row">`). */
  rowHeader?: boolean;
}

export interface SimpleTableProps<Row> {
  /** Résumé lu par les lecteurs d'écran. */
  caption: string;
  columns: SimpleTableColumn<Row>[];
  rows: Row[];
  rowKey: (row: Row, index: number) => string | number;
  /** Texte quand `rows` est vide (le tableau reste affiché). */
  empty?: ReactNode;
  /** Lignes plus serrées et texte plus petit. @default false */
  dense?: boolean;
  /** Cache la ligne d'en-têtes (les lecteurs d'écran la gardent). */
  hideHeader?: boolean;
  /** Surligne la ligne au survol. @default false */
  hoverable?: boolean;
  /** Alignement vertical du contenu des lignes. @default "middle" */
  rowAlign?: "middle" | "top";
  className?: string;
}

/**
 * Tableau statique, léger : pour quelques lignes déjà en mémoire (enregistrements DNS, mesures, membres).
 * Pour un tableau avec recherche, tri, pagination ou édition, utiliser `Table`.
 */
export default function SimpleTable<Row>({ caption, columns, rows, rowKey, empty, dense, hideHeader, hoverable, rowAlign = "middle", className }: SimpleTableProps<Row>) {
  const pad = dense ? "py-1" : "py-1.5";
  return (
    <table className={clsx("w-full max-sm:block max-sm:overflow-x-auto", dense ? "text-xs" : "text-sm", className)}>
      <caption className="sr-only">{caption}</caption>
      <thead className={clsx(hideHeader && "sr-only")}>
        <tr className="text-left opacity-60">
          {columns.map((c) => (
            <th key={c.key} scope="col" className={clsx(pad, "pr-3 font-normal", c.align === "right" && "text-right", c.srOnlyHeader && "sr-only")}>
              {c.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && empty && (
          <tr>
            <td colSpan={columns.length} className="p-3 text-center opacity-60">
              {empty}
            </td>
          </tr>
        )}
        {rows.map((row, i) => (
          <tr key={rowKey(row, i)} className={clsx("border-t border-vc-line", rowAlign === "top" && "align-top", hoverable && "hover:bg-vc-veil")}>
            {columns.map((c) => {
              const cls = clsx(pad, "pr-3", c.align === "right" && "text-right", c.className);
              return c.rowHeader ? (
                <th key={c.key} scope="row" className={clsx(cls, "text-left font-normal")}>
                  {c.render(row, i)}
                </th>
              ) : (
                <td key={c.key} className={cls}>
                  {c.render(row, i)}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
