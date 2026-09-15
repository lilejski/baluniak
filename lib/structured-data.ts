/**
 * Schema.org data for the home page, the about page and the case studies.
 *
 * Every page points at the same Person by `@id`, so search engines tie the
 * site and each project to one author — rather than guessing from the name,
 * which they were confusing with other people's.
 */

const SITE_URL = "https://baluniak.com";
const PERSON_ID = `${SITE_URL}/#person`;

type Lang = "pl" | "en";

const PROFILES = [
  "https://www.linkedin.com/in/%C5%82ukasz-ba%C5%82uniak-64734a256/",
  "https://github.com/lilejski",
];

const PERSON_CORE = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: "Łukasz Bałuniak",
  url: SITE_URL,
} as const;

function person(lang: Lang) {
  const isPl = lang === "pl";
  return {
    ...PERSON_CORE,
    image: `${SITE_URL}/og-baluniak.png`,
    jobTitle: isPl
      ? "Programista — strony internetowe, programy dla firm i automatyzacje"
      : "Developer — websites, business software and automation",
    knowsAbout: isPl
      ? [
          "strony internetowe dla firm",
          "programy do zarządzania firmą",
          "automatyzacja procesów w firmie",
          "wdrożenie AI w firmie",
          "chatboty dla firm",
          "Next.js",
          "TypeScript",
        ]
      : [
          "websites for small businesses",
          "custom business software",
          "business process automation",
          "AI for small businesses",
          "chatbots for business",
          "Next.js",
          "TypeScript",
        ],
    sameAs: PROFILES,
  };
}

export function personJsonLd(lang: Lang) {
  return { "@context": "https://schema.org", ...person(lang) };
}

/** The recruiter-facing page: a profile whose subject is the same Person. */
export function profilePageJsonLd(lang: Lang) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: `${SITE_URL}/${lang}/o-mnie`,
    inLanguage: lang,
    mainEntity: person(lang),
  };
}

export function caseStudyJsonLd(opts: {
  lang: Lang;
  slug: string;
  name: string;
  description: string;
  /** One of Google's application categories, e.g. BusinessApplication. */
  category: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: opts.name,
    description: opts.description,
    applicationCategory: opts.category,
    operatingSystem: "Web",
    url: `${SITE_URL}/${opts.lang}/projekty/${opts.slug}`,
    inLanguage: opts.lang,
    author: PERSON_CORE,
    creator: PERSON_CORE,
  };
}
