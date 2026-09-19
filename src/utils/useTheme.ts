import { useVolcaniumConfig } from "../components/config/VolcaniumProvider";

/**
 * Reads/writes the theme stored in `VolcaniumProvider` ("dark" | "light").
 * Must be used within a `VolcaniumProvider` — it drives the `data-theme`
 * attribute that every component's colors react to via CSS variables.
 */
export function useTheme() {
  const { theme, setTheme } = useVolcaniumConfig();
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  return { theme, setTheme, toggleTheme };
}
