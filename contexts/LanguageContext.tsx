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
import {
  type Language,
  translations,
  STORAGE_KEY_LANG,
  t as tRaw,
} from "@/lib/translations";

type LanguageContextValue = {
  lang: Language;
  setLang: (next: Language) => void;
  t: (path: string) => string;
  dict: (typeof translations)[Language];
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLang(): Language {
  if (typeof window === "undefined") return "PL";
  try {
    const stored = localStorage.getItem(STORAGE_KEY_LANG);
    if (stored === "EN" || stored === "PL") return stored;
  } catch {
    // ignore
  }
  return "PL";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("PL");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLangState(readStoredLang());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof document === "undefined") return;
    document.documentElement.lang = lang === "PL" ? "pl" : "en";
  }, [lang, mounted]);

  const setLang = useCallback((next: Language) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY_LANG, next);
    } catch {
      // ignore
    }
  }, []);

  const effectiveLang = mounted ? lang : "PL";
  const t = useCallback(
    (path: string) => tRaw(effectiveLang, path),
    [effectiveLang]
  );

  const dict = useMemo(
    () => translations[effectiveLang],
    [effectiveLang]
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ lang: effectiveLang, setLang, t, dict }),
    [effectiveLang, setLang, t, dict]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}
