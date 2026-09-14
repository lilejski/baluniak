/**
 * The topic backlog.
 *
 * Why this exists: the pipeline is meant to pick subjects from Search Console —
 * queries the site already half-ranks for. With only a handful of queries
 * recorded, that selection would be picking from noise. So topics are queued
 * by hand here, and the pipeline drains this list until the data is rich
 * enough to choose for itself. Nothing about the drafting changes; only where
 * the subject comes from.
 *
 * Add entries freely. Anything already published (matched by translationKey)
 * is skipped automatically.
 */

export type PlannedTopic = {
  /** Shared across the PL and EN versions — also the published frontmatter key. */
  translationKey: string;
  /** The search intent this should answer. Guides the angle, not a keyword to stuff. */
  targetQuery: { pl: string; en: string };
  /** What makes this piece worth reading rather than the tenth copy of the same advice. */
  angle: string;
  tags: { pl: string[]; en: string[] };
  /** Slugs of published posts worth linking to from this one. */
  relatedSlugs?: { pl: string[]; en: string[] };
};

export const TOPIC_BACKLOG: PlannedTopic[] = [
  {
    translationKey: "online-shop-first-steps",
    targetQuery: {
      pl: "jak założyć sklep internetowy krok po kroku",
      en: "how to start an online shop step by step",
    },
    angle:
      "Kolejność decyzji, nie lista narzędzi. Co trzeba rozstrzygnąć przed wyborem platformy: co sprzedajesz, jak wysyłasz, jak przyjmujesz płatność, kto to obsłuży. Uczciwie o tym, że gotowy sklep wystarcza większości i kiedy naprawdę potrzeba czegoś szytego.",
    tags: { pl: ["Sklepy online", "Małe firmy"], en: ["Online shops", "Small business"] },
    relatedSlugs: {
      pl: ["strona-internetowa-dla-malej-firmy"],
      en: ["website-for-small-business"],
    },
  },
  {
    translationKey: "ai-chatbot-for-business",
    targetQuery: {
      pl: "chatbot ai dla firmy czy warto",
      en: "ai chatbot for business is it worth it",
    },
    angle:
      "Kiedy chatbot pomaga, a kiedy jest przerostem formy nad treścią. Twarde kryterium: jeśli klienci zadają w kółko te same pytania, ma sens; jeśli każda sprawa jest inna, zaszkodzi. Odwołanie do własnego doświadczenia z wyłączonymi czatbotami na tej stronie.",
    tags: { pl: ["AI", "Obsługa klienta"], en: ["AI", "Customer service"] },
    relatedSlugs: {
      pl: ["co-da-sie-zautomatyzowac-w-malej-firmie"],
      en: ["what-to-automate-small-business"],
    },
  },
  {
    translationKey: "why-site-not-in-google",
    targetQuery: {
      pl: "dlaczego mojej strony nie ma w google",
      en: "why is my website not showing on google",
    },
    angle:
      "Diagnostyka od najczęstszej przyczyny do najrzadszej, po ludzku. Można oprzeć na realnym przypadku tej strony: sprzeczne znaczniki canonical i brak mapy witryny trzymały osiem z dziesięciu podstron poza indeksem. Konkretne kroki do sprawdzenia u siebie.",
    tags: { pl: ["SEO", "Google"], en: ["SEO", "Google"] },
    relatedSlugs: {
      pl: ["dlaczego-warto-porzucic-wordpress-dla-nextjs"],
      en: ["why-ditch-wordpress-for-nextjs"],
    },
  },
  {
    translationKey: "excel-to-system",
    targetQuery: {
      pl: "program do zarządzania zamówieniami dla małej firmy",
      en: "order management software for a small business",
    },
    angle:
      "Kiedy Excel przestaje wystarczać i co postawić w jego miejsce. Sygnały ostrzegawcze: dwie osoby edytują ten sam plik, historia zmian zniknęła, ktoś pracuje na starej kopii. Odwołanie do Charona jako przykładu systemu szytego pod jeden konkretny biznes.",
    tags: { pl: ["Systemy", "Automatyzacja"], en: ["Systems", "Automation"] },
    relatedSlugs: {
      pl: ["co-da-sie-zautomatyzowac-w-malej-firmie"],
      en: ["what-to-automate-small-business"],
    },
  },
  {
    translationKey: "product-photos-without-studio",
    targetQuery: {
      pl: "zdjęcia produktowe bez studia",
      en: "product photos without a studio",
    },
    angle:
      "Co realnie da się zrobić telefonem, a gdzie zaczyna się granica. Praktyczne minimum: światło, tło, kadr. Potem, gdzie AI pomaga i czego nie naprawi — z odwołaniem do Fotaroboty i uczciwym zastrzeżeniem, że narzędzie nie zastąpi złego zdjęcia wejściowego.",
    tags: { pl: ["E-commerce", "AI"], en: ["E-commerce", "AI"] },
    relatedSlugs: { pl: [], en: [] },
  },
];
