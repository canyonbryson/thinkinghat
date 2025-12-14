"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react";
import { ThemeTokens, ColorMode, ThemeStyle, createTheme, themes } from "./theme";

interface ThemeContextValue {
  theme: ThemeTokens;
  mode: ColorMode;
  style: ThemeStyle;
  setMode: (mode: ColorMode) => void;
  setStyle: (style: ThemeStyle) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: ColorMode;
  defaultStyle?: ThemeStyle;
}

export function ThemeProvider({
  children,
  defaultMode = "dark",
  defaultStyle = "modern",
}: ThemeProviderProps) {
  const [mode, setMode] = useState<ColorMode>(defaultMode);
  const [style, setStyle] = useState<ThemeStyle>(defaultStyle);

  const theme = useMemo(() => createTheme(mode, style), [mode, style]);

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const value = useMemo(
    () => ({
      theme,
      mode,
      style,
      setMode,
      setStyle,
      toggleMode,
    }),
    [theme, mode, style, toggleMode]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function useThemeTokens(): ThemeTokens {
  return useTheme().theme;
}

export { ThemeContext };

