import { useId, ReactNode, TextareaHTMLAttributes } from "react";

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "label"> {
  className?: string;
  label?: ReactNode;
  id?: string;
  variant?: "one" | "secondary";
  resize?: "none" | "vertical" | "horizontal" | "both";
}

export default function Textarea({
  className,
  label,
  id,
  variant = "one",
  resize = "vertical",
  ...props
}: TextareaProps) {
  const variants = {
    one: "bg-back",
    secondary: "bg-contaner",
  };

  const resizeMap = {
    none: "resize-none",
    vertical: "resize-y",
    horizontal: "resize-x",
    both: "resize",
  };

  const generatedId = useId();
  const textareaId = id || generatedId;

  const TextareaEl = (
    <textarea
      {...props}
      id={textareaId}
      className={`p-2 ${variants[variant]} ${resizeMap[resize]} rounded-lg outline-0 min-h-24 w-full ${className || ""}`}
    />
  );

  return label ? (
    <div className="flex flex-col gap-1">
      {TextareaEl}
      <label
        className="w-full -mt-1 mb-1 text-start text-sm text-white/50"
        htmlFor={textareaId}
      >
        {label}
      </label>
    </div>
  ) : (
    TextareaEl
  );
}
