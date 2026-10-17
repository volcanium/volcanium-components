import { AnchorHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

export interface LinkButtonProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "target" | "rel"> {
  icon?: ReactNode;
  /** Ouvre dans un nouvel onglet (ignoré avec `download`). @default true */
  newTab?: boolean;
  children: ReactNode;
}

/** Lien externe ou téléchargement qui a l'allure d'un petit bouton (`<a>` : on peut l'ouvrir dans un onglet, le copier). */
export default function LinkButton({ icon, newTab = true, download, className, children, ...props }: LinkButtonProps) {
  const external = newTab && download === undefined;
  return (
    <a
      className={clsx(
        "inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-md border border-vc-line-strong px-3 py-1.5 text-sm transition-colors hover:bg-vc-veil-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vc-main/50",
        className,
      )}
      download={download}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...props}
    >
      {icon}
      {children}
    </a>
  );
}
