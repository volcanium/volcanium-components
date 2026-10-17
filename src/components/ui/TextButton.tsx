import { ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

export interface TextButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Souligné en permanence (action dans une phrase, ex. « Réessayer ») plutôt qu'au survol seulement (nom cliquable d'une ligne). @default false */
  underline?: boolean;
}

/** Bouton qui ressemble à du texte : une action dans une phrase, ou un nom cliquable dans une liste. */
const TextButton = forwardRef<HTMLButtonElement, TextButtonProps>(
  ({ underline = false, className, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={clsx(
        "cursor-pointer text-left focus-visible:outline-none focus-visible:underline disabled:cursor-not-allowed disabled:opacity-50",
        underline ? "underline" : "hover:underline",
        className,
      )}
      {...props}
    />
  ),
);
TextButton.displayName = "TextButton";

export default TextButton;
