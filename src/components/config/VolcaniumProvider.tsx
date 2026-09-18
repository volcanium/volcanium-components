import { createContext, useContext, useState, ReactNode } from "react";

export type VolcaniumLanguage = "fr" | "en" | string;

export interface VolcaniumConfig {
  lang: VolcaniumLanguage;
}

const defaultConfig: VolcaniumConfig = {
  lang: "fr",
};

export interface VolcaniumContextValue {
  language: VolcaniumLanguage;
  setLanguage: (lang: VolcaniumLanguage) => void;
}

const VolcaniumContext = createContext<VolcaniumContextValue>({
  language: defaultConfig.lang,
  setLanguage: () => {},
});

export interface VolcaniumProviderProps {
  children: ReactNode;
  config?: Partial<VolcaniumConfig>;
}

export function VolcaniumProvider({ children, config = {} }: VolcaniumProviderProps) {
  const mergedConfig = { ...defaultConfig, ...config };
  const [language, setLanguage] = useState<VolcaniumLanguage>(mergedConfig.lang);

  return (
    <VolcaniumContext.Provider value={{ language, setLanguage }}>
      {children}
    </VolcaniumContext.Provider>
  );
}

export function useVolcaniumConfig() {
  return useContext(VolcaniumContext);
}
