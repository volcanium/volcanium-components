import { useId, useState, ReactNode, InputHTMLAttributes } from "react";
import clsx from "clsx";
import { IconEye, IconEyeOff, IconRefresh } from "@tabler/icons-react";
import { Squircle } from "@squircle-js/react";

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "label"
> {
  children?: string;
  className?: string;
  label?: ReactNode;
  id?: string;
  variant?: "one" | "secondary";
  loading?: boolean;
}

export default function Input({
  children,
  className,
  label,
  id,
  variant = "one",
  loading,
  type,
  disabled,
  ...props
}: InputProps) {
  const varaiants = {
    one: "bg-vc-container",
    secondary: "bg-vc-container",
  };

  const generatedId = useId();
  const inputId = id || generatedId;

  // Every `type="password"` field gets a show/hide toggle for free — handled
  // once here rather than by each consumer.
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword ? (visible ? "text" : "password") : type;

  const InputEl = (
    <div className={clsx("relative w-full", disabled && "opacity-50", className)}>
      <Squircle asChild cornerRadius={10} cornerSmoothing={1}>
        <input
          {...props}
          type={resolvedType}
          id={inputId}
          disabled={disabled}
          className={clsx(
            "w-full px-3.5 py-2 border border-vc-secondary/20 outline-none transition-colors duration-200 focus:border-vc-main/60 disabled:cursor-not-allowed placeholder:text-vc-secondary/40",
            isPassword && "pr-10",
            varaiants[variant],
          )}
          placeholder={children}
        />
      </Squircle>
      {isPassword && (
        // Absolutely positioned over the input itself (not a sibling in a
        // shared flex box) so Chrome's own autofill decorations — the
        // credential-icon/key it draws inside the field, its yellow autofill
        // background — land on one real `<input>` box like they expect,
        // instead of exposing a custom wrapper `<div>` around it.
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          className="absolute right-0 top-0 h-full px-3 flex items-center text-vc-main/70 transition-colors duration-150 hover:text-vc-main disabled:cursor-not-allowed cursor-pointer"
        >
          {visible ? <IconEyeOff size={17} /> : <IconEye size={17} />}
        </button>
      )}
    </div>
  );
  return label ? (
    <div className="flex flex-col gap-1">
      {InputEl}
      <label
        className="w-full -mt-1 mb-1 flex items-center gap-2 text-start text-sm text-vc-text/50"
        htmlFor={inputId}
      >
        {label}
        {loading && (
          <IconRefresh size={14} className="animate-spin text-vc-main/90" />
        )}
      </label>
    </div>
  ) : (
    InputEl
  );
}
