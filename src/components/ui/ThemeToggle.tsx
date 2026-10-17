import { Squircle } from "@squircle-js/react";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "../../utils/useTheme";
import { useLanguage } from "../../utils/useLanguage";

export interface ThemeToggleProps {
  className?: string;
}

/** A small switch flipping the `VolcaniumProvider` theme between dark/light. */
export default function ThemeToggle({ className }: ThemeToggleProps) {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <Squircle cornerRadius={7} cornerSmoothing={1} asChild>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isLight ? t("switch_to_dark") : t("switch_to_light")}
        aria-pressed={isLight}
        className={`flex h-9 w-9 items-center justify-center border border-vc-line bg-vc-container text-vc-secondary/70 transition-colors duration-200 hover:bg-vc-veil hover:text-vc-secondary cursor-pointer ${className || ""}`}
      >
        {isLight ? <IconMoon size={17} stroke={1.75} /> : <IconSun size={17} stroke={1.75} />}
      </button>
    </Squircle>
  );
}
