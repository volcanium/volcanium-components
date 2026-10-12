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

    const styles = {
      accent: "bg-vc-main border border-vc-secondary/40 text-vc-on-main",
      primary: "bg-vc-accent hover:bg-vc-main border border-vc-secondary/40 text-vc-on-main",
      secondary:
        "bg-vc-container hover:bg-vc-main/50 border border-vc-secondary/40 text-vc-secondary",
      discret: "border border-vc-secondary/70 hover:bg-vc-main/10",
      dangerous:
        "bg-vc-container border border-vc-danger/50 hover:border-vc-danger hover:bg-vc-danger/10 text-vc-secondary",
      tertiary: "bg-vc-container text-vc-secondary",
      // A deliberately light-on-both-themes chip — `overlay` (not `secondary`,
      // which flips to a dark foreground color in the light theme) stays a
      // pale neutral in dark and light alike, so `text-black` always reads.
      lum: "bg-vc-overlay text-black",
    };

    const btn = (
      <Squircle asChild cornerRadius={10} cornerSmoothing={1}>
        <button
          ref={ref}
          {...props}
          disabled={loading || disabled}
          className={clsx(
            "px-6 py-1.5 hover:scale-[1.02] active:scale-100 active:duration-100 cursor-pointer flex flex-row gap-2 justify-center items-center transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vc-main/50 focus-visible:ring-offset-2 focus-visible:ring-offset-vc-container",
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
        <a className={linkClassName || undefined} href={link}>
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
