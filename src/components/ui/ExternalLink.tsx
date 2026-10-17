import { AnchorHTMLAttributes } from "react";
import clsx from "clsx";

export interface ExternalLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "target" | "rel"> {
  /** Ouvre dans un nouvel onglet (`rel="noopener noreferrer"` ajouté). Ignoré si `download` est présent. @default true */
  newTab?: boolean;
}

/** Lien souligné vers une adresse externe, ou vers un fichier à télécharger (`download`). */
export default function ExternalLink({ newTab = true, download, className, ...props }: ExternalLinkProps) {
  const external = newTab && download === undefined;
  return (
    <a
      className={clsx("underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vc-main/50 rounded-sm", className)}
      download={download}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...props}
    />
  );
}
