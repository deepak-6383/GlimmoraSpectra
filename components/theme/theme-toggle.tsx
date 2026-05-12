"use client";

import { useTheme } from "./use-theme";

/**
 * Topbar-sized theme toggle.
 *
 * Visual language matches the existing app-shell buttons — same height,
 * radius, border, glass background, hover state. Inline SVG icons keep
 * the component dependency-free.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggle}
      title={label}
      aria-label={label}
      aria-pressed={isDark}
      className={
        "relative inline-flex h-9 w-9 items-center justify-center rounded-xl " +
        "border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] " +
        "transition-colors " +
        (className ?? "")
      }
    >
      <span className="relative h-4 w-4">
        {/* Sun — shown in dark mode (click to go light) */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={
            "absolute inset-0 h-4 w-4 text-amber-spec transition " +
            (isDark
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 -rotate-90 scale-75")
          }
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>

        {/* Moon — shown in light mode (click to go dark) */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={
            "absolute inset-0 h-4 w-4 text-violet-spec transition " +
            (isDark
              ? "opacity-0 rotate-90 scale-75"
              : "opacity-100 rotate-0 scale-100")
          }
          aria-hidden="true"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
        </svg>
      </span>
    </button>
  );
}
