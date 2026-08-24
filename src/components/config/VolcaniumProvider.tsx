import React, { createContext, useContext, ReactNode } from "react";

export type VolcaniumLanguage = "fr" | "en" | string;

export interface VolcaniumConfig {
  
  lang: VolcaniumLanguage;
}

const defaultConfig: VolcaniumConfig = {
  lang: "fr",
};

const VolcaniumContext = createContext<VolcaniumConfig>(defaultConfig);

export interface VolcaniumProviderProps {
  children: ReactNode;
  
  config?: Partial<VolcaniumConfig>;
}

export function VolcaniumProvider({ children, config = {} }: VolcaniumProviderProps) {
  const mergedConfig = { ...defaultConfig, ...config };
  
  return (
    <VolcaniumContext.Provider value={mergedConfig}>
      {children}
    </VolcaniumContext.Provider>
  );
}

export function useVolcaniumConfig() {
  return useContext(VolcaniumContext);
}
