import { AnchorHTMLAttributes } from "react";
import { Link as RRLink } from "react-router-dom";
import clsx from "clsx";

export interface RouterLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  /** Chemin interne de l'application (`/rules`, `/projects/3?tab=monitoring`). */
  to: string;
  /** Souligné en permanence (lien dans une phrase) plutôt qu'au survol seulement. @default true */
  underline?: boolean;
}

/** Lien vers une autre page de l'application : un vrai `<a href>` (clic droit, nouvel onglet, clavier), sans rechargement. À utiliser dans un `<Router>`. */
export default function RouterLink({ to, underline = true, className, ...props }: RouterLinkProps) {
  return (
    <RRLink
      to={to}
      className={clsx(
        "rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vc-main/50",
        underline ? "underline" : "hover:underline",
        className,
      )}
      {...props}
    />
  );
}
