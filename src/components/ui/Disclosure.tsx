import { ReactNode } from "react";
import clsx from "clsx";

export interface DisclosureProps {
  /** Texte toujours visible, qui ouvre ou ferme le contenu au clic. */
  summary: ReactNode;
  children: ReactNode;
  /** Ouvert au départ. @default false */
  defaultOpen?: boolean;
  /** Encadre la zone (pour un bloc d'options avancées au milieu d'une carte). @default false */
  bordered?: boolean;
  className?: string;
}

/** Zone repliable (« Options avancées », « Chronologie »), basée sur `<details>` : clavier et lecteurs d'écran gérés par le navigateur. */
export default function Disclosure({ summary, children, defaultOpen, bordered, className }: DisclosureProps) {
  return (
    <details open={defaultOpen} className={clsx(bordered && "rounded border border-vc-line p-2", className)}>
      <summary className="cursor-pointer text-sm opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vc-main/50 rounded-sm">{summary}</summary>
      <div className="mt-2">{children}</div>
    </details>
  );
}
