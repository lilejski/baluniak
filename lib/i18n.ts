/**
 * One place that knows which languages the site speaks.
 *
 * Before German there were two of everything — a ternary per file for the
 * URL segment, the og:locale, the date format and the hreflang map. A third
 * language turns every one of those into a bug waiting to happen, so they all
 * live here as lookups instead.
 */

import type { Language } from "@/lib/translations";

export const LOCALES = ["pl", "en", "de"] as const;
export type Locale = (typeof LOCALES)[number];

export const SITE_URL = "https://baluniak.com";

const BY_SEGMENT: Record<Locale, Language> = { pl: "PL", en: "EN", de: "DE" };
const BY_LANGUAGE: Record<Language, Locale> = { PL: "pl", EN: "en", DE: "de" };

export function isLocale(segment: string): segment is Locale {
  return (LOCALES as readonly string[]).includes(segment);
}

/** URL segment → dictionary key. Unknown segments fall back to Polish. */
export function toLanguage(segment: string): Language {
  return isLocale(segment) ? BY_SEGMENT[segment] : "PL";
}

/** Dictionary key → URL segment. */
export function toLocale(lang: Language): Locale {
  return BY_LANGUAGE[lang];
}

export const OG_LOCALE: Record<Locale, string> = {
  pl: "pl_PL",
  en: "en_US",
  de: "de_DE",
};

/** Date formatting locale. en-GB, because 20 September beats September 20. */
export const DATE_LOCALE: Record<Locale, string> = {
  pl: "pl-PL",
  en: "en-GB",
  de: "de-DE",
};

/**
 * hreflang map for a path given without the locale segment ("" for the home
 * page, "/blog" for the listing). Spelling every language out keeps Google
 * from reading the three versions as duplicates of one another.
 */
export function languageAlternates(path = ""): Record<string, string> {
  return Object.fromEntries(LOCALES.map((locale) => [locale, `${SITE_URL}/${locale}${path}`]));
}
