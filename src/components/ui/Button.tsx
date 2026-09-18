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
      accent: "bg-main border-1 border-secondary/40 text-white",
      primary: "bg-accent hover:bg-main border-1 border-secondary/40",
      secondary:
        "bg-container hover:bg-main/50 border-1 border-secondary/40 text-white",
      discret: "border-1 border-secondary/70 hover:bg-main/10",
      dangerous:
        "bg-container border-1 border-red-500/50 hover:border-red-500 hover:bg-red-500/10 text-white",
      tertiary: "bg-container text-white",
      lum: "bg-secondary text-black",
    };

    const btn = (
      <Squircle asChild cornerRadius={10} cornerSmoothing={1}>
        <button
          ref={ref}
          {...props}
          disabled={loading || disabled}
          className={clsx(
            "px-6 py-1 hover:scale-103 active:scale-100 cursor-pointer flex flex-row gap-2 justify-center items-center transition disabled:opacity-50 disabled:cursor-not-allowed",
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
      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
    />
  );
}

export default Button;
