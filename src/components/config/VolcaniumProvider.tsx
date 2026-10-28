import { createContext, useContext, useEffect, useLayoutEffect, useState, ReactNode } from "react";
import { readSharedTheme, writeSharedTheme } from "../../utils/themeStorage";

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

/**
 * Shared by every Volcanium app so the choice follows the person from one app to another: stored in a cookie on the parent domain
 * (`.volcanium.eu`, see `utils/themeStorage`), with localStorage as fallback. Also the localStorage key.
 */
export const THEME_STORAGE_KEY = "volcanium-theme";
/** Keys used by apps before the shared one existed: read once, then superseded. */
const LEGACY_THEME_KEYS = ["ee-theme", "ve-theme"];

function readStoredTheme(key: string | false): VolcaniumTheme | undefined {
  if (key === false) return undefined;
  return readSharedTheme(LEGACY_THEME_KEYS);
}

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export interface VolcaniumProviderProps {
  children: ReactNode;
  /** `lang`/`theme` given here win over the stored theme, and follow later changes of these props (e.g. the app's own i18n language). */
  config?: Partial<VolcaniumConfig>;
  /** Remembers the theme (shared cookie + localStorage). Defaults to `volcanium-theme`; `false` disables persistence. */
  themeStorageKey?: string | false;
  /** Cookie domain override (default: the parent domain of the page, e.g. `.volcanium.eu`; none on localhost). `false` = host-only cookie. */
  themeCookieDomain?: string | false;
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
export function VolcaniumProvider({ children, config = {}, themeStorageKey = THEME_STORAGE_KEY, themeCookieDomain }: VolcaniumProviderProps) {
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
    writeSharedTheme(next, themeCookieDomain); // the theme still applies for this session if storage/cookies are refused
  };

  // Before the first paint, so a stored light theme never flashes dark.
  useIsomorphicLayoutEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Another app (another subdomain) or another tab changed the shared cookie: follow it when this tab comes back into view.
  useEffect(() => {
    if (themeStorageKey === false || config.theme) return undefined;
    const sync = () => {
      const shared = readStoredTheme(themeStorageKey);
      if (shared) setThemeState((cur) => (cur === shared ? cur : shared));
    };
    window.addEventListener("focus", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      window.removeEventListener("focus", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [themeStorageKey, config.theme]);

  return (
    <VolcaniumContext.Provider value={{ language, setLanguage, theme, setTheme }}>
      {children}
    </VolcaniumContext.Provider>
  );
}

export function useVolcaniumConfig() {
  return useContext(VolcaniumContext);
}
