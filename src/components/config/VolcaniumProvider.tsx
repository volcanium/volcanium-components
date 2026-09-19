import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type VolcaniumLanguage = "fr" | "en" | string;
export type VolcaniumTheme = "dark" | "light";

export interface VolcaniumConfig {
  lang: VolcaniumLanguage;
  theme: VolcaniumTheme;
}

const defaultConfig: VolcaniumConfig = {
  lang: "fr",
  theme: "dark",
};

export interface VolcaniumContextValue {
  language: VolcaniumLanguage;
  setLanguage: (lang: VolcaniumLanguage) => void;
  theme: VolcaniumTheme;
  setTheme: (theme: VolcaniumTheme) => void;
}

const VolcaniumContext = createContext<VolcaniumContextValue>({
  language: defaultConfig.lang,
  setLanguage: () => {},
  theme: defaultConfig.theme,
  setTheme: () => {},
});

export interface VolcaniumProviderProps {
  children: ReactNode;
  config?: Partial<VolcaniumConfig>;
}

/**
 * Wraps the app, providing language + theme. The theme is applied via a
 * `data-theme` attribute on `<html>` — every component reads its colors from
 * CSS variables that `data-theme="light"` redefines (see `index.css`), so
 * nothing else needs to know the theme exists.
 *
 * This has to land on `<html>` rather than a wrapper `<div>`: several
 * components (`Select`, `DatePicker`, `InformationButton`'s inline select)
 * render their dropdown through a portal straight into `document.body`,
 * outside any wrapper this provider could render — a `data-theme` on the
 * wrapper would simply never reach them. CSS variables cascade from `<html>`
 * to the whole document regardless of where a node's *DOM* parent is.
 */
export function VolcaniumProvider({ children, config = {} }: VolcaniumProviderProps) {
  const mergedConfig = { ...defaultConfig, ...config };
  const [language, setLanguage] = useState<VolcaniumLanguage>(mergedConfig.lang);
  const [theme, setTheme] = useState<VolcaniumTheme>(mergedConfig.theme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <VolcaniumContext.Provider value={{ language, setLanguage, theme, setTheme }}>
      {children}
    </VolcaniumContext.Provider>
  );
}

export function useVolcaniumConfig() {
  return useContext(VolcaniumContext);
}
