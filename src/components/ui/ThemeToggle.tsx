import { Squircle } from "@squircle-js/react";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "../../utils/useTheme";

export interface ThemeToggleProps {
  className?: string;
}

/** A small switch flipping the `VolcaniumProvider` theme between dark/light. */
export default function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <Squircle cornerRadius={10} cornerSmoothing={1} asChild>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isLight ? "Passer en thème sombre" : "Passer en thème clair"}
        aria-pressed={isLight}
        className={`flex h-9 w-9 items-center justify-center border border-line bg-container text-secondary/70 transition-colors duration-200 hover:bg-veil hover:text-secondary cursor-pointer ${className || ""}`}
      >
        {isLight ? <IconMoon size={17} stroke={1.75} /> : <IconSun size={17} stroke={1.75} />}
      </button>
    </Squircle>
  );
}
