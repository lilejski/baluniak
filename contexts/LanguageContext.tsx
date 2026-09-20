"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  type Language,
  translations,
  STORAGE_KEY_LANG,
  t as tRaw,
} from "@/lib/translations";
import { isLocale, toLanguage, toLocale, type Locale } from "@/lib/i18n";

type LanguageContextValue = {
  lang: Language;
  setLang: (next: Language) => void;
  t: (path: string) => string;
  dict: (typeof translations)[Language];
  /** URL segment for current language (pl | en | de). Use for Link hrefs. */
  localeSegment: Locale;
  mounted: boolean;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

/** A store that never changes — only its server and client snapshots differ. */
const subscribeNoop = () => () => {};

export function LanguageProvider({
  children,
  initialLang,
}: {
  children: ReactNode;
  initialLang: Language;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [langState, setLangState] = useState<Language>(initialLang);

  // False during server render and hydration, true afterwards. Read from React
  // rather than flipped in an effect, which cost an extra render on every load.
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);

  // The URL decides the language, so back/forward and direct links are right
  // without syncing state in an effect. Local state only bridges the moment
  // between clicking the switcher and the navigation landing.
  const segment = pathname?.split("/")[1]?.toLowerCase();
  const lang: Language = segment && isLocale(segment) ? toLanguage(segment) : langState;

  useEffect(() => {
    if (!mounted || typeof document === "undefined") return;
    document.documentElement.lang = toLocale(lang);
  }, [lang, mounted]);

  const setLang = useCallback(
    (next: Language) => {
      if (next === lang) return;
      setLangState(next);
      try {
        localStorage.setItem(STORAGE_KEY_LANG, next);
        document.cookie = `${STORAGE_KEY_LANG}=${toLocale(next)};path=/;max-age=31536000`;
      } catch {
        // ignore
      }
      const segment = toLocale(next);

      // Prefer the page's own declared alternate. Swapping just the locale
      // prefix assumes the rest of the path is identical in both languages,
      // which is false wherever the slug is translated — blog articles, for
      // one — and lands the visitor on a 404. Pages emit these alternates
      // already, for hreflang, so this reuses a source of truth rather than
      // duplicating the slug mapping on the client.
      let newPath: string | null = null;
      if (typeof document !== "undefined") {
        const alternate = document.querySelector<HTMLLinkElement>(
          `link[rel="alternate"][hreflang="${segment}"]`
        );
        if (alternate?.href) {
          try {
            newPath = new URL(alternate.href).pathname;
          } catch {
            newPath = null;
          }
        }
      }

      if (!newPath) {
        const rest = pathname?.replace(/^\/(pl|en|de)/, "") || "";
        newPath = `/${segment}${rest}`;
      }

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
      localeSegment: toLocale(effectiveLang),
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
