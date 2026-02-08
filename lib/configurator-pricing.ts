/**
 * Pricing config and calculation for the Project Configurator.
 * Base rates, per-page, and feature add-ons. Output: price range + complexity.
 */

export const PRICING_CONFIG = {
  /** Base price (PLN) by project type */
  base: {
    landing: 1000,
    saas: 5000,
    ecommerce: 3500,
  },
  /** Per page add-on (PLN) */
  perPage: 200,
  /** Feature add-ons (PLN) */
  features: {
    aiChatbot: 1000,
    authDatabase: 1500,
    payments: 1000,
    cms: 600,
    booking: 800,
    darkMode: 200,
  },
} as const;

export type ProjectType = keyof typeof PRICING_CONFIG.base;
export type FeatureId = keyof typeof PRICING_CONFIG.features;

export interface ConfiguratorSelection {
  projectType: ProjectType;
  pageCount: number;
  cms: boolean;
  auth: boolean;
  features: FeatureId[];
}

/** Single-point estimate (before range). */
function getBaseTotal(selection: ConfiguratorSelection): number {
  const { base, perPage, features } = PRICING_CONFIG;
  let total = base[selection.projectType] ?? base.landing;
  total += selection.pageCount * perPage;
  if (selection.cms) total += features.cms;
  if (selection.auth) total += features.authDatabase;
  for (const id of selection.features) {
    const add = features[id as FeatureId];
    if (typeof add === "number") total += add;
  }
  return total;
}

/** Price range (min–max PLN) for display. */
export function getPriceRange(selection: ConfiguratorSelection): { min: number; max: number } {
  const total = getBaseTotal(selection);
  const margin = Math.max(500, Math.round(total * 0.15));
  return {
    min: Math.round((total - margin) / 100) * 100,
    max: Math.round((total + margin) / 100) * 100,
  };
}

/** Complexity score 0–100 from selection. */
function getComplexityScore(selection: ConfiguratorSelection): number {
  let score = 0;
  if (selection.projectType === "landing") score += 10;
  else if (selection.projectType === "ecommerce") score += 50;
  else score += 60; // saas
  score += Math.min(selection.pageCount * 2, 30);
  if (selection.cms) score += 10;
  if (selection.auth) score += 15;
  score += selection.features.length * 8;
  return Math.min(100, score);
}

export type ComplexityLevel = "low" | "medium" | "high";

export function getComplexity(selection: ConfiguratorSelection): { level: ComplexityLevel; score: number } {
  const score = getComplexityScore(selection);
  const level: ComplexityLevel = score < 35 ? "low" : score < 65 ? "medium" : "high";
  return { level, score };
}
