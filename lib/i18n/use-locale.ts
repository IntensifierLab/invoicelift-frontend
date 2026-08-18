"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_LOCALE, TRANSLATIONS, type Locale, type TranslationKey } from "./translations";

const KEY = "invoicelift:locale";
const CHANGE_EVENT = "invoicelift:locale-changed";

function readLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const stored = localStorage.getItem(KEY);
  return stored === "en" || stored === "fr" || stored === "pt" ? stored : DEFAULT_LOCALE;
}

/**
 * Current locale plus a `t()` translator, backed by localStorage so the
 * choice survives navigation and a refresh. No layout/provider wiring
 * required — each consumer reads the same persisted value independently,
 * and `setLocale` broadcasts a change event so already-mounted consumers
 * (e.g. a `<LanguageSwitcher>` in one place, translated text in another)
 * update together without a shared React context tree.
 */
export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    setLocaleState(readLocale());
    const onChange = () => setLocaleState(readLocale());
    window.addEventListener(CHANGE_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(CHANGE_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const setLocale = useCallback((next: Locale) => {
    localStorage.setItem(KEY, next);
    document.documentElement.lang = next;
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const t = useCallback((key: TranslationKey) => TRANSLATIONS[locale][key], [locale]);

  return { locale, setLocale, t };
}
