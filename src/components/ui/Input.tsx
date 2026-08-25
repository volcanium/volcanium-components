import { useId, ReactNode, InputHTMLAttributes } from "react";
import { IconRefresh } from "@tabler/icons-react";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "label"> {
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
    one: "bg-back",
    secondary: "bg-contaner",
  };

  const generatedId = useId();
  const inputId = id || generatedId;

  const InputEl = (
    <input
      {...props}
      id={inputId}
      className={`p-2 ${varaiants[variant]} rounded-lg outline-0 ${className || ""}`}
      placeholder={children}
    />
  );
  return label ? (
    <div className="flex flex-col gap-1">
      {InputEl}
      <label
        className="w-full -mt-1 mb-1 flex items-center gap-2 text-start text-sm text-white/50"
        htmlFor={inputId}
      >
        {label}
        {loading && <IconRefresh size={14} className="animate-spin text-main" />}
      </label>
    </div>
  ) : (
    InputEl
  );
}
