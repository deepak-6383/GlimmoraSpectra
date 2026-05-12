"use client";

import { createContext } from "react";

export type Theme = "dark" | "light";
export type ThemePreference = Theme | "system";

export const THEME_STORAGE_KEY = "gs.theme";
export const DEFAULT_THEME: Theme = "dark";

export type ThemeContextValue = {
  /** The resolved theme actually applied to <html> ("dark" | "light"). */
  theme: Theme;
  /** The user's stored preference — may be "system". */
  preference: ThemePreference;
  /** Switch to an explicit theme (persists). */
  setTheme: (theme: Theme) => void;
  /** Follow the OS preference (persists "system"). */
  followSystem: () => void;
  /** Convenience: flip between dark and light, leaving "system" mode. */
  toggle: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);
