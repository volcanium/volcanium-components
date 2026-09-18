import { useId, ReactNode, InputHTMLAttributes } from "react";
import { IconRefresh } from "@tabler/icons-react";
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
  ...props
}: InputProps) {
  const varaiants = {
    one: "bg-container",
    secondary: "bg-container",
  };

  const generatedId = useId();
  const inputId = id || generatedId;

  const InputEl = (
    <Squircle asChild cornerRadius={10} cornerSmoothing={1}>
      <input
        {...props}
        id={inputId}
        className={`w-52 px-3 py-1 border border-secondary/20 focus:border-accent/50 ${varaiants[variant]} outline-0 ${className || ""}`}
        placeholder={children}
      />
    </Squircle>
  );
  return label ? (
    <div className="flex flex-col gap-1">
      {InputEl}
      <label
        className="w-full -mt-1 mb-1 flex items-center gap-2 text-start text-sm text-white/50"
        htmlFor={inputId}
      >
        {label}
        {loading && (
          <IconRefresh size={14} className="animate-spin text-main/90" />
        )}
      </label>
    </div>
  ) : (
    InputEl
  );
}
