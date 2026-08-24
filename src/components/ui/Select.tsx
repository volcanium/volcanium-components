import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useId,
  ReactNode,
} from "react";
import Button from "./Button";
import { IconSelector, IconX } from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "../../utils/useLanguage";

export interface SelectOption {
  label: ReactNode;
  value: any;
}

export interface SelectProps {
  options?: SelectOption[];
  value?: any;
  onChange?: (value: any) => void;
  placeholder?: string;
  label?: ReactNode;
  id?: string;
  variant?: "default" | "one" | "secondary";
  className?: string;
}

export default function Select({
  options = [],
  value,
  onChange,
  placeholder,
  label,
  id,
  variant = "default",
  className = "",
}: SelectProps) {
  const { t } = useLanguage();
  const actualPlaceholder = placeholder || t("select_placeholder");

  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [ready, setReady] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const generatedId = useId();
  const selectId = id || generatedId;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  useLayoutEffect(() => {
    const updatePosition = () => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setOpenUpward(spaceBelow < 200 && spaceAbove > spaceBelow);
    };
    updatePosition();
    setReady(true);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const updatePosition = () => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setOpenUpward(spaceBelow < 200 && spaceAbove > spaceBelow);
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);

  const isInputVariant = variant === "one" || variant === "secondary";
  const inputBg = variant === "secondary" ? "bg-contaner" : "bg-back";

  const TriggerElement = isInputVariant ? (
    <button
      id={selectId}
      type="button"
      onClick={() => setOpen(!open)}
      className={`p-2 ${inputBg} flex flex-1 rounded-lg px-10 outline-0 justify-between items-center relative ${className}`}
    >
      <span className={`${selected ? "" : "opacity-50"}`}>
        {selected ? selected.label : actualPlaceholder}
      </span>
      <span className="flex items-center justify-center opacity-50">
        <IconSelector size={18} />
      </span>
    </button>
  ) : (
    <Button
      id={selectId}
      onClick={() => setOpen(!open)}
      className={`min-w-52 justify-between bg-secondary/20 hover:bg-main focus:bg-main relative ${className}`}
    >
      <span className={`${selected ? "" : "opacity-60"}`}>
        {selected ? selected.label : actualPlaceholder}
      </span>
      <span
        className={`absolute right-2 transition-transform duration-300 ${open ? "scale-0" : "scale-100"}`}
      >
        <IconSelector />
      </span>
      <span
        className={`absolute right-2 transition-transform duration-300 ${open ? "scale-100" : "scale-0"}`}
      >
        <IconX />
      </span>
    </Button>
  );

  const SelectWrapper = (
    <div ref={ref} className={`relative inline-block font-main text-text`}>
      {TriggerElement}

      <AnimatePresence>
        {open && ready && (
          <motion.div
            initial={{ opacity: 0, y: openUpward ? 5 : -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: openUpward ? 5 : -5 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className={`absolute left-0 w-full z-50
              ${openUpward ? "bottom-full mb-2 origin-bottom" : "top-full mt-2 origin-top"}
            `}
          >
            <div className="bg-contaner rounded-xl shadow-2xl p-2 flex flex-col gap-1 border border-overlay/10 backdrop-blur max-h-60 overflow-y-auto">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange?.(opt.value);
                    setOpen(false);
                  }}
                  className={`
                    px-3 py-2 rounded-lg text-left transition-all duration-150
                    hover:bg-main hover:scale-[1.02]
                    ${value === opt.value ? "bg-main/80" : "bg-transparent"}
                  `}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return label ? (
    <div className={`flex flex-col gap-1`}>
      {SelectWrapper}
      <label
        className="-mt-1 mb-1 text-start text-sm text-white/50"
        htmlFor={selectId}
      >
        {label}
      </label>
    </div>
  ) : (
    SelectWrapper
  );
}
