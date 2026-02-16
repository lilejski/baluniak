/**
 * Kreator Projektu: branching funnel types and step config.
 * Branch "standard" = wizytówka; "professional" = MVP/SaaS.
 */

import type { Language } from "./translations";
import { translations } from "./translations";

export type Branch = "standard" | "professional";

export type StandardAnswers = {
  branding: "wizerunek" | "portfolio" | "kontakt";
  sections: { about: boolean; gallery: boolean; contact: boolean };
  deadline: "asap" | "2weeks" | "1month";
};

export type ProfessionalAnswers = {
  aiIntegration: "fal" | "openai" | "both";
  payments: boolean;
  userAuth: boolean;
  scalability: boolean;
};

/** Advanced modules (checkboxes) – shared by both branches. */
export type AdvancedModules = {
  seo: boolean;
  cms: boolean;
  i18n: boolean;
  analytics: boolean;
  legal: boolean;
};

export const ADVANCED_MODULE_IDS = ["seo", "cms", "i18n", "analytics", "legal"] as const;
export type AdvancedModuleId = (typeof ADVANCED_MODULE_IDS)[number];

/** Price in PLN for each advanced module. */
export const ADVANCED_MODULE_PRICES: Record<AdvancedModuleId, number> = {
  seo: 500,
  cms: 2000,
  i18n: 1000,
  analytics: 300,
  legal: 200,
};

export type FunnelState = {
  branch: Branch | null;
  step: number;
  standard?: Partial<StandardAnswers>;
  professional?: Partial<ProfessionalAnswers>;
  modules?: Partial<AdvancedModules>;
};

const DEFAULT_STANDARD: StandardAnswers = {
  branding: "wizerunek",
  sections: { about: true, gallery: false, contact: true },
  deadline: "2weeks",
};

const DEFAULT_PROFESSIONAL: ProfessionalAnswers = {
  aiIntegration: "fal",
  payments: false,
  userAuth: false,
  scalability: true,
};

export const STANDARD_STEP_IDS = ["branding", "sections", "deadline", "modules"] as const;
export const PROFESSIONAL_STEP_IDS = ["ai", "payments", "auth", "scale", "modules"] as const;

export function getStandardSteps(lang: Language) {
  return translations[lang].kreator.steps.standard;
}
export function getProfessionalSteps(lang: Language) {
  return translations[lang].kreator.steps.professional;
}

export function getTotalSteps(branch: Branch): number {
  return branch === "standard" ? STANDARD_STEP_IDS.length : PROFESSIONAL_STEP_IDS.length;
}

export function getDefaultAnswers(branch: Branch): StandardAnswers | ProfessionalAnswers {
  return branch === "standard" ? { ...DEFAULT_STANDARD } : { ...DEFAULT_PROFESSIONAL };
}

/** Build a config object to send to architect API (and for offer summary). */
export function buildConfigForApi(state: FunnelState): Record<string, unknown> {
  const base =
    state.branch === "standard" && state.standard
      ? { branch: "standard" as const, ...state.standard }
      : state.branch === "professional" && state.professional
        ? { branch: "professional" as const, ...state.professional }
        : { branch: state.branch };
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
    if (p.scalability) parts.push(k.serverless);
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
    lineItems.push({ id: "base", label: labels.baseStandard, price: 3500 });
    total = 3500;
    const s = state.standard?.sections;
    if (s) {
      const sectionsCount = [s.about, s.gallery, s.contact].filter(Boolean).length;
      if (sectionsCount > 0) {
        const extra = sectionsCount * 500;
        lineItems.push({ id: "pages", label: `${labels.extraSections} (×${sectionsCount})`, price: extra });
        total += extra;
      }
    }
  } else if (state.branch === "professional") {
    lineItems.push({ id: "base", label: labels.baseProfessional, price: 8500 });
    total = 8500;
    const p = state.professional;
    if (p) {
      if (p.aiIntegration) {
        lineItems.push({ id: "ai", label: labels.ai, price: 2000 });
        total += 2000;
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
    const moduleLabels: Record<AdvancedModuleId, string> = labels.modules ?? {} as Record<AdvancedModuleId, string>;
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
    const d = state.standard?.deadline;
    if (d === "asap") return t.standardAsap;
    if (d === "2weeks") return t.standard2weeks;
    if (d === "1month") return t.standard1month;
    return t.standardDefault;
  }
  if (state.branch === "professional") {
    return t.professional;
  }
  return "";
}
