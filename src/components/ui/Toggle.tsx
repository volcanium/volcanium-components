import React from "react";
import { IconRefresh } from "@tabler/icons-react";

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  loading?: boolean;
  variant?: "one" | "secondary";
}

export default function Toggle({
  checked,
  onChange,
  disabled,
  label,
  loading,
  variant = "one",
}: ToggleProps) {
  const uncheckedBg = variant === "secondary" ? "bg-vc-container" : "bg-vc-back";

  return (
    <div className="flex items-center justify-between gap-3 mt-1">
      {(label || loading) && (
        <span className="text-vc-text/50 text-sm flex items-center gap-2">
          {label}
          {loading && <IconRefresh size={14} className="animate-spin text-vc-main" />}
        </span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled || loading}
        onClick={() => !(disabled || loading) && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          checked ? "bg-vc-main" : `${uncheckedBg} shadow-inner`
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
