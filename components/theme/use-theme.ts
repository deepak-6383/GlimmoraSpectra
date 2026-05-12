"use client";

import { useContext } from "react";
import { DEFAULT_THEME, ThemeContext, type ThemeContextValue } from "./theme-context";

/**
 * Access the current theme + setters.
 *
 * If called outside `<ThemeProvider>` (e.g. an isolated test, an error
 * boundary screen during boot) it falls back to a no-op shape so the
 * caller never crashes. Real installs will always be inside the provider.
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx) return ctx;
  return {
    theme: DEFAULT_THEME,
    preference: DEFAULT_THEME,
    setTheme: () => {},
    followSystem: () => {},
    toggle: () => {},
  };
}
