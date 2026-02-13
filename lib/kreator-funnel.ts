/**
 * Kreator Projektu: branching funnel types and step config.
 * Branch "standard" = wizytówka; "professional" = MVP/SaaS.
 */

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

export type FunnelState = {
  branch: Branch | null;
  step: number;
  standard?: Partial<StandardAnswers>;
  professional?: Partial<ProfessionalAnswers>;
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

export const STANDARD_STEPS = [
  { id: "branding", label: "Na czym ma się skupić strona?" },
  { id: "sections", label: "Jakie sekcje?" },
  { id: "deadline", label: "Termin realizacji" },
] as const;

export const PROFESSIONAL_STEPS = [
  { id: "ai", label: "Integracja AI" },
  { id: "payments", label: "Płatności" },
  { id: "auth", label: "Użytkownicy / logowanie" },
  { id: "scale", label: "Skalowalność" },
] as const;

export function getTotalSteps(branch: Branch): number {
  return branch === "standard" ? STANDARD_STEPS.length : PROFESSIONAL_STEPS.length;
}

export function getDefaultAnswers(branch: Branch): StandardAnswers | ProfessionalAnswers {
  return branch === "standard" ? { ...DEFAULT_STANDARD } : { ...DEFAULT_PROFESSIONAL };
}

/** Build a config object to send to architect API (and for offer summary). */
export function buildConfigForApi(state: FunnelState): Record<string, unknown> {
  if (state.branch === "standard" && state.standard) {
    return { branch: "standard", ...state.standard };
  }
  if (state.branch === "professional" && state.professional) {
    return { branch: "professional", ...state.professional };
  }
  return { branch: state.branch };
}

/** Human-readable tech stack summary for the offer card. */
export function getStackSummary(state: FunnelState): string {
  if (state.branch === "standard") {
    const s = state.standard;
    if (!s) return "Next.js + Tailwind — strona wizytówka.";
    const parts = ["Next.js", "Tailwind CSS", "Responsywny design"];
    if (s.sections?.gallery) parts.push("Galeria");
    if (s.sections?.about) parts.push("Sekcja O nas");
    if (s.sections?.contact) parts.push("Kontakt / formularz");
    return parts.join(" + ") + ".";
  }
  if (state.branch === "professional") {
    const p = state.professional;
    if (!p) return "Next.js + wybrane moduły (AI, płatności, auth).";
    const parts = ["Next.js", "Tailwind", "TypeScript"];
    if (p.aiIntegration === "fal") parts.push("Fal.ai");
    else if (p.aiIntegration === "openai") parts.push("OpenAI");
    else if (p.aiIntegration === "both") parts.push("Fal.ai + OpenAI");
    if (p.payments) parts.push("Autopay / Stripe");
    if (p.userAuth) parts.push("Auth (np. Supabase)");
    if (p.scalability) parts.push("Serverless (Vercel)");
    return parts.join(" + ") + ".";
  }
  return "";
}

/** Timeline text for the offer. */
export function getTimelineSummary(state: FunnelState): string {
  if (state.branch === "standard") {
    const d = state.standard?.deadline;
    if (d === "asap") return "Realizacja w ciągu 1–2 tygodni (w zależności od obłożenia).";
    if (d === "2weeks") return "Szacowany czas: ok. 2 tygodnie.";
    if (d === "1month") return "Szacowany czas: do 1 miesiąca.";
    return "Szacowany czas: 2–4 tygodnie.";
  }
  if (state.branch === "professional") {
    return "Model 80h MVP: pełna realizacja MVP w ok. 80 godzin roboczych (ok. 2–3 tygodnie przy stałym tempie).";
  }
  return "";
}
