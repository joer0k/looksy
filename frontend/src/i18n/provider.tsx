"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { LOCALE_COOKIE, writePreferenceCookie, type Locale } from "@/lib/preferences";
import { getDictionary, type Dictionary } from "./index";

type I18nContextValue = {
  locale: Locale;
  t: Dictionary;
  setLocale: (locale: Locale) => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ initialLocale, children }: { initialLocale: Locale; children: ReactNode }) {
  const [locale, setLocaleState] = useState(initialLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    writePreferenceCookie(LOCALE_COOKIE, next);
    document.documentElement.lang = next;
    document.title = getDictionary(next).meta.title;
  }, []);

  const value = useMemo(() => ({ locale, t: getDictionary(locale), setLocale }), [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside <I18nProvider>.");
  return context;
}
