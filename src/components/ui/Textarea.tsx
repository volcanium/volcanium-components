import { useId, ReactNode, TextareaHTMLAttributes } from "react";
import { Squircle } from "@squircle-js/react";

export interface TextareaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "label"
> {
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
    one: "bg-vc-container",
    secondary: "bg-vc-container",
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
    <Squircle asChild cornerRadius={7} cornerSmoothing={1}>
      <textarea
        {...props}
        id={textareaId}
        className={`px-3 py-1 max-sm:w-full max-sm:text-base max-sm:py-2 ${variants[variant]} ${resizeMap[resize]} w-52 max-w-full min-w-30 min-h-20 max-h-100 border border-vc-line-strong focus:border-vc-accent/50 outline-0 ${className || ""}`}
      />
    </Squircle>
  );

  return label ? (
    <div className="flex flex-col gap-1">
      {TextareaEl}
      <label
        className="w-full -mt-1 mb-1 text-start text-sm text-vc-text/50"
        htmlFor={textareaId}
      >
        {label}
      </label>
    </div>
  ) : (
    TextareaEl
  );
}
