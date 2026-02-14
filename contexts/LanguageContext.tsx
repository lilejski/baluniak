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
import { usePathname, useRouter } from "next/navigation";
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
  /** URL segment for current language (pl | en). Use for Link hrefs. */
  localeSegment: string;
  mounted: boolean;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function langToSegment(lang: Language): "pl" | "en" {
  return lang === "PL" ? "pl" : "en";
}

export function LanguageProvider({
  children,
  initialLang,
  localeSegment,
}: {
  children: ReactNode;
  initialLang: Language;
  localeSegment: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [lang, setLangState] = useState<Language>(initialLang);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync state from URL when pathname changes (e.g. back/forward)
  useEffect(() => {
    const segment = pathname?.split("/")[1]?.toLowerCase();
    if (segment === "pl") setLangState("PL");
    else if (segment === "en") setLangState("EN");
  }, [pathname]);

  useEffect(() => {
    if (!mounted || typeof document === "undefined") return;
    document.documentElement.lang = lang === "PL" ? "pl" : "en";
  }, [lang, mounted]);

  const setLang = useCallback(
    (next: Language) => {
      if (next === lang) return;
      setLangState(next);
      try {
        localStorage.setItem(STORAGE_KEY_LANG, next);
        document.cookie = `${STORAGE_KEY_LANG}=${langToSegment(next)};path=/;max-age=31536000`;
      } catch {
        // ignore
      }
      const rest = pathname?.replace(/^\/(pl|en)/, "") || "";
      const newPath = `/${langToSegment(next)}${rest}`;
      router.push(newPath);
    },
    [lang, pathname, router]
  );

  const effectiveLang = mounted ? lang : initialLang;
  const t = useCallback(
    (path: string) => tRaw(effectiveLang, path),
    [effectiveLang]
  );

  const dict = useMemo(
    () => translations[effectiveLang],
    [effectiveLang]
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang: effectiveLang,
      setLang,
      t,
      dict,
      localeSegment: langToSegment(effectiveLang),
      mounted,
    }),
    [effectiveLang, setLang, t, dict, mounted]
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
