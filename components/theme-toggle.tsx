"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "invoicelift-theme";
const LIGHT = "light";
const DARK = "dark";

type Theme = typeof LIGHT | typeof DARK;

/**
 * Applies the given theme to <html> and persists it to localStorage.
 * Exposed so the no-flash inline script can call it synchronously.
 */
function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // localStorage may be unavailable (private browsing, SSR)
  }
}

/**
 * Reads the stored theme. Falls back to the OS preference when nothing
 * has been saved yet; returns `null` during SSR where neither is available.
 */
function getStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === LIGHT || stored === DARK) return stored;
  } catch {
    // localStorage unavailable
  }
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? LIGHT
      : DARK;
  }
  return null;
}

/**
 * Theme toggle button placed in the site navbar.
 *
 * Syncs with the `data-theme` attribute on <html> so the CSS variables
 * declared in `app/globals.css` switch the entire palette. The no-flash
 * inline script in `app/layout.tsx` runs before hydration so the user
 * never sees the wrong theme on first paint.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(DARK);

  // Hydrate from localStorage / system preference on mount
  useEffect(() => {
    const t = getStoredTheme() ?? DARK;
    setTheme(t);
    applyTheme(t);
  }, []);

  const toggle = () => {
    const next = theme === DARK ? LIGHT : DARK;
    setTheme(next);
    applyTheme(next);
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={`Switch to ${theme === DARK ? LIGHT : DARK} mode`}
      title={`Switch to ${theme === DARK ? LIGHT : DARK} mode`}
    >
      {theme === DARK ? (
        /* Sun icon (light mode) */
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        /* Moon icon (dark mode) */
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}