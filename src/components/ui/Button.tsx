import clsx from "clsx";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";

type Variant = "primary" | "secondary" | "tertiary" | "lum";

type ButtonProps = {
  children: ReactNode;
  className?: string;
  link?: string;
  loading?: boolean;
  variant?: Variant;
  linkClassName?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  className = "",
  link,
  onClick,
  loading = false,
  disabled,
  variant = "primary",
  linkClassName,
  ...props
}: ButtonProps, ref) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading) return;
    else if (onClick) onClick(e);
  };

  const styles = {
    primary: "bg-main text-white",
    secondary: "bg-back  text-white",
    tertiary: "bg-back-2/50 text-white",
    lum: "bg-secondary text-black",
  };

  const btn = (
    <button
      ref={ref}
      {...props}
      disabled={loading || disabled}
      className={clsx(
        "sm:py-1 sm:px-4 py-2 px-5 rounded-lg hover:scale-105 cursor-pointer flex flex-row gap-2 justify-center items-center transition disabled:opacity-50 disabled:cursor-not-allowed",
        styles[variant],
        className,
      )}
      onClick={handleClick}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );

  return link ? (
    <Link className={linkClassName || undefined} to={link}>
      {btn}
    </Link>
  ) : (
    btn
  );
});

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
