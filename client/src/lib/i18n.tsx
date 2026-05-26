"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

type Locale = "fr" | "en";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, defaultValue?: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_KEY = "strategia-locale";

function getInitialLocale(): Locale {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored === "fr" || stored === "en") return stored;
    const browserLang = navigator.language?.split("-")[0];
    if (browserLang === "fr") return "fr";
  }
  return "en";
}

async function loadMessages(locale: Locale): Promise<Record<string, any>> {
  try {
    if (locale === "fr") {
      const msg = await import("@/messages/fr.json");
      return msg.default || msg;
    }
    const msg = await import("@/messages/en.json");
    return msg.default || msg;
  } catch {
    return {};
  }
}

function getNestedValue(obj: Record<string, any>, path: string): string | undefined {
  const keys = path.split(".");
  let value: any = obj;
  for (const key of keys) {
    if (value == null || typeof value !== "object") return undefined;
    value = value[key];
  }
  return typeof value === "string" ? value : undefined;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);
  const [messages, setMessages] = useState<Record<string, any>>({});

  useEffect(() => {
    loadMessages(locale).then(setMessages);
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newLocale);
    }
  }, []);

  const t = useCallback(
    (key: string, defaultValue?: string): string => {
      const value = getNestedValue(messages, key);
      if (value !== undefined) return value;
      return defaultValue ?? key;
    },
    [messages]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return ctx;
}
