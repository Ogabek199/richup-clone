"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { translate, type Locale } from "@/i18n/messages";

const STORAGE_KEY = "richup-locale";

type I18nContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function readInitialLocale(): Locale {
  if (typeof window === "undefined") return "en";
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s === "uz" || s === "en") return s;
  } catch {
    /* ignore */
  }
  try {
    if (navigator.language.toLowerCase().startsWith("uz")) return "uz";
  } catch {
    /* ignore */
  }
  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    // After hydration, apply saved locale / browser language (SSR defaults to "en").
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from storage
    setLocaleState(readInitialLocale());
  }, []);

  useEffect(() => {
    try {
      document.documentElement.lang = locale === "uz" ? "uz" : "en";
    } catch {
      /* ignore */
    }
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
      document.documentElement.lang = l === "uz" ? "uz" : "en";
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(locale, key, params),
    [locale]
  );

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
