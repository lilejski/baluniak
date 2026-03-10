/**
 * Kreator Projektu: 5-step linear funnel types and config.
 * Steps: Cel → Skala → Silnik → AI → Podsumowanie.
 */

import type { Language } from "./translations";
import { translations } from "./translations";

export type FunnelAnswers = {
  // Step 1: Cel (Wizerunek/SaaS/Sklep)
  branding: "landing" | "wizytowka" | "rozbudowana";

  // Step 2: Skala (Liczba sekcji i podstron)
  sections: {
    about: boolean;
    gallery: boolean;
    contact: boolean;
    pricing: boolean;
    faq: boolean;
    blog: boolean;
    team: boolean;
    portfolio: boolean;
    testimonials: boolean;
    process: boolean;
  };

  // Step 3: Silnik (CMS, i18n, Wydajność)
  engine: {
    seo: boolean;
    cms: boolean;
    i18n: boolean;
  };

  // Step 4: Automatyzacja AI (Moduły generatywne)
  modules: Partial<AdvancedModules>;
};

export type AdvancedModules = {
  content: boolean;
  chatbot: boolean;
};

export const ADVANCED_MODULE_IDS = ["content", "chatbot"] as const;
export type AdvancedModuleId = (typeof ADVANCED_MODULE_IDS)[number];

export const ADVANCED_MODULE_PRICES: Record<AdvancedModuleId, number> = {
  content: 1500,
  chatbot: 2500,
};

export type FunnelState = {
  step: number;
  answers: Partial<FunnelAnswers>;
};

const DEFAULT_ANSWERS: FunnelAnswers = {
  branding: "landing",
  sections: {
    about: true,
    gallery: false,
    contact: true,
    pricing: false,
    faq: false,
    blog: false,
    team: false,
    portfolio: false,
    testimonials: false,
    process: false,
  },
  engine: {
    seo: false,
    cms: false,
    i18n: false,
  },
  modules: {},
};

export const STEP_IDS = ["branding", "sections", "engine", "modules", "summary"] as const;

export function getSteps(lang: Language) {
  return [
    { id: "branding", label: lang === "PL" ? "Cel platformy" : "Platform goal" },
    { id: "sections", label: lang === "PL" ? "Skala projektu" : "Project scale" },
    { id: "engine", label: lang === "PL" ? "Silnik i funkcje" : "Engine & features" },
    { id: "modules", label: lang === "PL" ? "Automatyzacja AI" : "AI Automation" },
  ];
}

export function getTotalSteps(): number {
  return 4; // Summary is step 5 (total steps to fill is 4)
}

export function getDefaultAnswers(): FunnelAnswers {
  return { ...DEFAULT_ANSWERS };
}

/** Build a config object to send to architect API (and for offer summary). */
export function buildConfigForApi(state: FunnelState): Record<string, unknown> {
  const selectedModules =
    state.answers.modules && typeof state.answers.modules === "object"
      ? ADVANCED_MODULE_IDS.filter((id) => state.answers.modules![id])
      : [];
  return { ...state.answers, advancedModules: selectedModules };
}

/** Human-readable tech stack summary for the offer card. */
export function getStackSummary(state: FunnelState, lang: Language = "PL"): string {
  const k = translations[lang].kreator.stack;
  const s = state.answers;
  if (!s) return k.standardBase;

  const parts: string[] = [k.nextjs, k.tailwind, k.responsive];
  if (s.sections?.gallery) parts.push(k.gallery);
  if (s.sections?.about) parts.push(k.aboutSection);
  if (s.sections?.contact) parts.push(k.contactForm);
  if (s.engine?.cms) parts.push("Headless CMS");

  return parts.join(" + ") + ".";
}

/** Price breakdown: base + add-ons. Standard 3500 PLN base, Professional 8500. Add-ons: AI +2000, Auth +1000, Payments +1500, Extra pages +500 each. */
export type PriceLineItem = { id: string; label: string; price: number };

export function getPriceBreakdown(state: FunnelState, lang: Language = "PL"): { lineItems: PriceLineItem[]; total: number } {
  const labels = translations[lang].kreator.priceLabels;
  const lineItems: PriceLineItem[] = [];
  let total = 0;

  let basePrice = 499;
  let baseLabel: string = labels.baseStandard;

  if (state.answers?.branding === "wizytowka") {
    basePrice = 999;
  } else if (state.answers?.branding === "rozbudowana") {
    basePrice = 1499;
    baseLabel = labels.baseProfessional;
  }

  lineItems.push({ id: "base", label: baseLabel, price: basePrice });
  total = basePrice;

  const s = state.answers?.sections;
  if (s) {
    const sectionsCount = Object.values(s).filter(Boolean).length;
    if (sectionsCount > 5) {
      const extraCount = sectionsCount - 5;
      const extraPrice = extraCount * 200;
      lineItems.push({ id: "pages", label: `${labels.extraSections} (+${extraCount})`, price: extraPrice });
      total += extraPrice;
    }
  }

  const e = state.answers?.engine;
  if (e) {
    if (e.seo) {
      lineItems.push({ id: "seo", label: labels.modules?.seo || "Wydajność i SEO", price: 600 });
      total += 600;
    }
    if (e.cms) {
      lineItems.push({ id: "cms", label: labels.modules?.cms || "CMS", price: 1200 });
      total += 1200;
    }
    if (e.i18n) {
      lineItems.push({ id: "i18n", label: labels.modules?.i18n || "i18n", price: 1000 });
      total += 1000;
    }
  }

  const mods = state.answers?.modules;
  if (mods && typeof mods === "object") {
    const moduleLabels: Record<string, string> = labels.modules ?? {};
    for (const id of ADVANCED_MODULE_IDS) {
      if (mods[id]) {
        const price = ADVANCED_MODULE_PRICES[id];
        const label = moduleLabels[id] ?? id;
        lineItems.push({ id: `module_${id}`, label, price });
        total += price;
      }
    }
  }

  return { lineItems, total };
}

/** Timeline text for the offer. */
export function getTimelineSummary(state: FunnelState, lang: Language = "PL"): string {
  const t = translations[lang].kreator.timeline;
  if (state.answers?.branding === "rozbudowana") {
    return t.professional;
  }
  return t.standardDefault;
}

/** Estimated days (number) for animated counter in Summary. */
export function getEstimatedDays(state: FunnelState): number {
  if (state.answers?.branding === "rozbudowana") return 30;
  return 14;
}
