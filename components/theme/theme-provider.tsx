"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  ThemeContext,
  type Theme,
  type ThemePreference,
} from "./theme-context";

const SYSTEM_QUERY = "(prefers-color-scheme: light)";

function readStoredPreference(): ThemePreference {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (raw === "dark" || raw === "light" || raw === "system") return raw;
  } catch {
    // localStorage may be unavailable in private mode; fall through
  }
  return DEFAULT_THEME;
}

function resolveTheme(preference: ThemePreference): Theme {
  if (preference === "dark" || preference === "light") return preference;
  if (typeof window === "undefined") return DEFAULT_THEME;
  return window.matchMedia(SYSTEM_QUERY).matches ? "light" : "dark";
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // We optimistically render with the no-FOUC script's value (set on <html>
  // before React boots). The hook below then syncs React state to whatever
  // is actually on the DOM, avoiding hydration mismatches.
  const [preference, setPreferenceState] = useState<ThemePreference>(DEFAULT_THEME);
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);

  // First mount — read the persisted preference and the DOM value the
  // inline script already applied.
  useEffect(() => {
    const pref = readStoredPreference();
    const resolved = resolveTheme(pref);
    setPreferenceState(pref);
    setThemeState(resolved);
    applyTheme(resolved);
  }, []);

  // Follow OS changes only when preference === "system".
  useEffect(() => {
    if (preference !== "system" || typeof window === "undefined") return;
    const mq = window.matchMedia(SYSTEM_QUERY);
    const handler = () => {
      const next: Theme = mq.matches ? "light" : "dark";
      setThemeState(next);
      applyTheme(next);
    };
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, [preference]);

  const setTheme = useCallback((next: Theme) => {
    setPreferenceState(next);
    setThemeState(next);
    applyTheme(next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* ignore persistence failures */
    }
  }, []);

  const followSystem = useCallback(() => {
    setPreferenceState("system");
    const resolved = resolveTheme("system");
    setThemeState(resolved);
    applyTheme(resolved);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, "system");
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  const value = useMemo(
    () => ({ theme, preference, setTheme, followSystem, toggle }),
    [theme, preference, setTheme, followSystem, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Inline script that runs *before* React hydrates. Set in <head> via
 * dangerouslySetInnerHTML so first paint already carries the correct
 * theme — no flash of unstyled content.
 *
 * Reads the user's persisted preference, falls back to the system colour
 * scheme when "system" was selected, and finally defaults to dark.
 */
export const themeBootstrapScript = `
(function() {
  try {
    var k = ${JSON.stringify(THEME_STORAGE_KEY)};
    var raw = window.localStorage.getItem(k);
    var pref = (raw === "dark" || raw === "light" || raw === "system") ? raw : ${JSON.stringify(DEFAULT_THEME)};
    var resolved = pref;
    if (pref === "system") {
      resolved = window.matchMedia("${SYSTEM_QUERY}").matches ? "light" : "dark";
    }
    var html = document.documentElement;
    html.setAttribute("data-theme", resolved);
    html.style.colorScheme = resolved;
  } catch (e) {
    document.documentElement.setAttribute("data-theme", ${JSON.stringify(DEFAULT_THEME)});
  }
})();
`.trim();
