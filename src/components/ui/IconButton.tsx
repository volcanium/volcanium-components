import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";
import clsx from "clsx";

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label" | "title"> {
  /** Nom accessible, obligatoire (le bouton n'a pas de texte). Sert aussi d'info-bulle si `title` est absent. */
  label: string;
  /** Info-bulle (par défaut : `label`). */
  title?: string;
  /** Icône à afficher. */
  children: ReactNode;
  /** Action en cours : le bouton pulse et se désactive. */
  busy?: boolean;
  /** `sm` pour les lignes denses (tableaux, listes). @default "md" */
  size?: "sm" | "md";
}

/** Petit bouton carré portant une icône seule (monter, supprimer, copier…), bien plus compact qu'un `Button`. */
const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, title, children, busy, size = "md", className, disabled, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={title ?? label}
      disabled={busy || disabled}
      className={clsx(
        "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md border border-vc-line-strong transition-colors hover:bg-vc-veil-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vc-main/50 disabled:cursor-not-allowed disabled:opacity-40",
        size === "sm" ? "h-6 w-6" : "h-8 w-8",
        busy && "animate-pulse",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
);
IconButton.displayName = "IconButton";

export default IconButton;
