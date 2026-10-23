import clsx from "clsx";
import { motion } from "framer-motion";
import { Link, useInRouterContext } from "react-router-dom";
import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";
import { Squircle } from "@squircle-js/react";

type Variant =
  | "primary"
  | "accent"
  | "secondary"
  | "dangerous"
  | "discret"
  | "tertiary"
  | "lum";

type ButtonProps = {
  children: ReactNode;
  className?: string;
  link?: string;
  loading?: boolean;
  variant?: Variant;
  linkClassName?: string;
  /** Avec `link` : ouvre dans un nouvel onglet (lien externe). @default false */
  external?: boolean;
  icon?: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = "",
      link,
      onClick,
      loading = false,
      disabled,
      variant = "primary",
      linkClassName,
      external = false,
      icon,
      ...props
    }: ButtonProps,
    ref,
  ) => {
    const inRouterContext = useInRouterContext();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (loading) return;
      else if (onClick) onClick(e);
    };

    // Refonte graphique : boutons sobres. Surfaces neutres + filet fin ; l'orange de la marque
    // n'est gardé que pour la variante `accent` (un seul appel à l'action par écran).
    const styles = {
      accent: "bg-vc-main border border-vc-main text-vc-on-main hover:brightness-110",
      primary: "bg-vc-veil-strong hover:bg-vc-line-strong border border-vc-line-strong text-vc-text",
      secondary: "bg-transparent hover:bg-vc-veil border border-vc-line-strong text-vc-secondary",
      discret: "border border-transparent hover:bg-vc-veil-strong text-vc-secondary",
      dangerous:
        "bg-transparent border border-vc-danger/40 hover:border-vc-danger hover:bg-vc-danger/10 text-vc-danger",
      tertiary: "bg-vc-veil text-vc-secondary hover:bg-vc-veil-strong",
      // A deliberately light-on-both-themes chip — `overlay` (not `secondary`,
      // which flips to a dark foreground color in the light theme) stays a
      // pale neutral in dark and light alike, so `text-black` always reads.
      lum: "bg-vc-overlay text-black",
    };

    const btn = (
      <Squircle asChild cornerRadius={7} cornerSmoothing={1}>
        <button
          ref={ref}
          {...props}
          disabled={loading || disabled}
          className={clsx(
            "px-6 py-2 max-sm:min-h-11 cursor-pointer flex flex-row gap-2 justify-center items-center transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vc-main/50 focus-visible:ring-offset-2 focus-visible:ring-offset-vc-container",
            styles[variant],
            className,
          )}
          onClick={handleClick}
        >
          {loading ? <Spinner /> : icon}
          {children}
        </button>
      </Squircle>
    );

    if (link) {
      if (inRouterContext) {
        return (
          <Link className={linkClassName || undefined} to={link}>
            {btn}
          </Link>
        );
      }
      return (
        <a className={linkClassName || undefined} href={link} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {btn}
        </a>
      );
    }
    return btn;
  },
);

function Spinner() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
    />
  );
}

export default Button;
