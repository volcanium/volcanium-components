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

/** Shared by every Volcanium app so the choice follows the person from one app to another (same origin). */
export const THEME_STORAGE_KEY = "volcanium-theme";
/** Keys used by apps before the shared one existed: read once, then superseded. */
const LEGACY_THEME_KEYS = ["ee-theme", "ve-theme"];

function readStoredTheme(key: string | false): VolcaniumTheme | undefined {
  if (key === false || typeof window === "undefined") return undefined;
  try {
    for (const k of [key, ...LEGACY_THEME_KEYS]) {
      const v = window.localStorage.getItem(k);
      if (v === "dark" || v === "light") return v;
    }
  } catch {
    // storage unavailable (private mode…): fall back to the default
  }
  return undefined;
}

export interface VolcaniumProviderProps {
  children: ReactNode;
  /** `lang`/`theme` given here win over the stored theme, and follow later changes of these props (e.g. the app's own i18n language). */
  config?: Partial<VolcaniumConfig>;
  /** localStorage key remembering the theme. Defaults to `volcanium-theme`; `false` disables persistence. */
  themeStorageKey?: string | false;
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
export function VolcaniumProvider({ children, config = {}, themeStorageKey = THEME_STORAGE_KEY }: VolcaniumProviderProps) {
  const [language, setLanguage] = useState<VolcaniumLanguage>(config.lang ?? defaultConfig.lang);
  const [theme, setThemeState] = useState<VolcaniumTheme>(config.theme ?? readStoredTheme(themeStorageKey) ?? defaultConfig.theme);

  // The app's own language/theme (props) stay the source of truth when they change.
  useEffect(() => {
    if (config.lang) setLanguage(config.lang);
  }, [config.lang]);
  useEffect(() => {
    if (config.theme) setThemeState(config.theme);
  }, [config.theme]);

  const setTheme = (next: VolcaniumTheme) => {
    setThemeState(next);
    if (themeStorageKey === false) return;
    try {
      window.localStorage.setItem(themeStorageKey, next);
    } catch {
      // storage unavailable: the theme still applies for this session
    }
  };

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
