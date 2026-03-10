/**
 * Kreator Projektu: branching funnel types and step config.
 * Branch "standard" = wizytówka; "professional" = MVP/SaaS.
 */

import type { Language } from "./translations";
import { translations } from "./translations";

export type Branch = "standard";

export type StandardAnswers = {
  branding: "landing" | "wizytowka" | "rozbudowana";
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
};

export type ProfessionalAnswers = {
  aiIntegration: "fal" | "openai" | "both";
  payments: boolean;
  userAuth: boolean;
};

/** Advanced modules (checkboxes) – shared by both branches. */
export type AdvancedModules = {
  seo: boolean;
  cms: boolean;
  i18n: boolean;
  analytics: boolean;
  legal: boolean;
  // New AI SaaS modules
  imgGen: boolean;
  videoGen: boolean;
  marketing: boolean;
  chatbots: boolean;
};

export const ADVANCED_MODULE_IDS = [
  "seo", "cms", "i18n", "analytics", "legal",
  "imgGen", "videoGen", "marketing", "chatbots"
] as const;
export type AdvancedModuleId = (typeof ADVANCED_MODULE_IDS)[number];

/** Price in PLN for each advanced module. */
export const ADVANCED_MODULE_PRICES: Record<AdvancedModuleId, number> = {
  seo: 249,
  cms: 499,
  i18n: 399,
  analytics: 149,
  legal: 99,
  imgGen: 299,
  videoGen: 499,
  marketing: 299,
  chatbots: 999,
};

export type FunnelState = {
  branch: Branch | null;
  step: number;
  standard?: Partial<StandardAnswers>;
  professional?: Partial<ProfessionalAnswers>;
  modules?: Partial<AdvancedModules>;
};

const DEFAULT_STANDARD: StandardAnswers = {
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
};

const DEFAULT_PROFESSIONAL: ProfessionalAnswers = {
  aiIntegration: "fal",
  payments: false,
  userAuth: false,
};

export const STANDARD_STEP_IDS = ["branding", "sections", "modules"] as const;
export const PROFESSIONAL_STEP_IDS = ["ai", "payments", "auth", "modules"] as const;

export function getStandardSteps(lang: Language) {
  return translations[lang].kreator.steps.standard;
}

export function getTotalSteps(branch: Branch): number {
  return STANDARD_STEP_IDS.length;
}

export function getDefaultAnswers(branch: Branch): StandardAnswers {
  return { ...DEFAULT_STANDARD };
}

/** Build a config object to send to architect API (and for offer summary). */
export function buildConfigForApi(state: FunnelState): Record<string, unknown> {
  const base = state.standard ? { branch: "standard" as const, ...state.standard } : { branch: "standard" as const };
  const selectedModules =
    state.modules && typeof state.modules === "object"
      ? ADVANCED_MODULE_IDS.filter((id) => state.modules![id])
      : [];
  return { ...base, advancedModules: selectedModules };
}

/** Human-readable tech stack summary for the offer card. */
export function getStackSummary(state: FunnelState, lang: Language = "PL"): string {
  const k = translations[lang].kreator.stack;
  if (state.branch === "standard") {
    const s = state.standard;
    if (!s) return k.standardBase;
    const parts: string[] = [k.nextjs, k.tailwind, k.responsive];
    if (s.sections?.gallery) parts.push(k.gallery);
    if (s.sections?.about) parts.push(k.aboutSection);
    if (s.sections?.contact) parts.push(k.contactForm);
    return parts.join(" + ") + ".";
  }
  if (state.branch === "professional") {
    const p = state.professional;
    if (!p) return k.professionalBase;
    const parts: string[] = [k.nextjs, k.tailwind, k.typescript];
    if (p.aiIntegration === "fal") parts.push(k.fal);
    else if (p.aiIntegration === "openai") parts.push(k.openai);
    else if (p.aiIntegration === "both") parts.push(k.falOpenai);
    if (p.payments) parts.push(k.autopayStripe);
    if (p.userAuth) parts.push(k.authSupabase);
    return parts.join(" + ") + ".";
  }
  return "";
}

/** Price breakdown: base + add-ons. Standard 3500 PLN base, Professional 8500. Add-ons: AI +2000, Auth +1000, Payments +1500, Extra pages +500 each. */
export type PriceLineItem = { id: string; label: string; price: number };

export function getPriceBreakdown(state: FunnelState, lang: Language = "PL"): { lineItems: PriceLineItem[]; total: number } {
  const labels = translations[lang].kreator.priceLabels;
  const lineItems: PriceLineItem[] = [];
  let total = 0;

  if (state.branch === "standard") {
    let basePrice = 499;
    let baseLabel: string = labels.baseStandard;

    if (state.standard?.branding === "wizytowka") {
      basePrice = 999;
    } else if (state.standard?.branding === "rozbudowana") {
      basePrice = 1499;
      baseLabel = labels.baseProfessional;
    }

    lineItems.push({ id: "base", label: baseLabel, price: basePrice });
    total = basePrice;
    const s = state.standard?.sections;
    if (s) {
      const sectionsCount = Object.values(s).filter(Boolean).length;
      if (sectionsCount > 0) {
        const extra = sectionsCount * 99;
        lineItems.push({ id: "pages", label: `${labels.extraSections} (×${sectionsCount})`, price: extra });
        total += extra;
      }
    }
  } else if (state.branch === "professional") {
    lineItems.push({ id: "base", label: labels.baseProfessional, price: 6500 });
    total = 6500;
    const p = state.professional;
    if (p) {
      if (p.aiIntegration) {
        lineItems.push({ id: "ai", label: labels.ai, price: 1500 });
        total += 1500;
      }
      if (p.userAuth) {
        lineItems.push({ id: "auth", label: labels.auth, price: 1000 });
        total += 1000;
      }
      if (p.payments) {
        lineItems.push({ id: "payments", label: labels.payments, price: 1500 });
        total += 1500;
      }
    }
  }

  const mods = state.modules;
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
  if (state.branch === "standard") {
    return t.standardDefault;
  }
  if (state.branch === "professional") {
    return t.professional;
  }
  return "";
}

/** Estimated days (number) for animated counter in Summary. */
export function getEstimatedDays(state: FunnelState): number {
  if (state.branch === "standard") {
    return 14;
  }
  if (state.branch === "professional") return 45;
  return 0;
}
