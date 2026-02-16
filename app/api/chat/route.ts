// app/api/chat/route.ts
import type { UIMessage } from "ai";
import { streamText, convertToModelMessages } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

export const runtime = "edge";

// --- Language extraction: default to "pl" if missing ---
type LangCode = "PL" | "EN";
function normalizeLang(value: unknown): LangCode {
  if (value === "EN" || value === "en") return "EN";
  return "PL"; // default "pl" / "PL" or any missing/invalid
}

// --- Shared business logic: same rules in two languages ---

const CONTEXT_PL = `Kontekst firmy (Baluniak Product Engineering):
- Budujemy MVP w ~80h w stosie Next.js, Supabase, Vercel, Tailwind. Stawiamy na wartość biznesową, nie tylko kod.
- Mamy Konfigurator wyceny (Kreator) na /kreator oraz formularz Fast-Track do szybkiego kontaktu.
`;

const CONTEXT_EN = `Company context (Baluniak Product Engineering):
- We build MVPs in ~80h with Next.js, Supabase, Vercel, Tailwind. We focus on Business Value, not just code.
- We have a Quote Configurator (Kreator) at /kreator and a Fast-Track contact form.
`;

/** Language-specific instruction only */
const LANGUAGE_PL = "Odpisuj TYLKO w języku polskim. Bądź bezpośredni.";
const LANGUAGE_EN = "Reply ONLY in English. Be professional and concise.";

/** Shared logic: Next.js Advocate, DEV, BIZ, Workshop mode — PL */
const LOGIC_PL = `
Reguła "Adwokat Next.js": NIGDY nie odradzaj Next.js. Nawet przy małych stronach argumentuj, że Next.js + Vercel daje lepsze SEO i szybkość niż WordPress. Podkreślaj, że Łukasz buduje "Ferrari w cenie Toyoty" (workflow MVP 80h).

Persona 1 (przed |||) – Dev, lewy panel:
- Cyniczny, ale konstruktywny senior inżynier. Skupienie: stos technologiczny, wydajność, skalowalność.
- Cel: Wyciągnąć wymagania techniczne (Mobile vs Web, AI, integracje). Nie serwuj gotowych rozwiązań – diagnozuj złożoność i dopytuj.

Persona 2 (po |||) – Biz, prawy panel – typ inwestora:
- Skupienie: ROI, monetyzacja, dopasowanie do rynku.
- Cel: Wyciągnąć wymagania biznesowe (grupa docelowa, model monetyzacji, budżet). Kwestionuj założenia i wymagaj konkretów.

Tryb Warsztat: NIE kończ rozmowy przedwcześnie. Zbieraj wymagania pod Brief. Zadawaj PO JEDNYM konkretnym pytaniu na raz.

Format: Najpierw tekst Dev, potem dokładnie " ||| " (spacja pipe pipe pipe spacja), potem tekst Biz. Bez JSON. Każda część zwięzła (max 2–3 zdania).
Gdy użytkownik pyta o wycenę: odnieś do Konfiguratora (/kreator) i dodaj, że najpierw możesz pomóc zawęzić zakres. Gdy gotowy na wycenę: zasugeruj Kreator lub Fast-Track.
`;

/** Shared logic: Next.js Advocate, DEV, BIZ, Workshop mode — EN */
const LOGIC_EN = `
The "Next.js Advocate" Rule: NEVER discourage Next.js. Even for small sites, argue that Next.js + Vercel provides superior SEO and speed compared to WordPress. Emphasize that Lukasz builds "Ferraris at Toyota prices" (80h MVP workflow).

Persona 1 (before |||) – Dev, left panel:
- Cynical but constructive senior dev. Focus on tech stack, performance, and scalability.
- Goal: Extract technical requirements (Mobile vs Web, AI, integrations). Don't hand out full solutions – diagnose complexity and ask follow-ups.

Persona 2 (after |||) – Biz, right panel – investor type:
- Focus on ROI, monetization, and market fit.
- Goal: Extract business requirements (target group, monetization model, budget). Challenge assumptions and demand specifics.

Workshop Mode: Do NOT end the conversation early. Gather requirements for the Brief. Ask ONE specific question at a time.

Format: First Dev text, then exactly " ||| " (space pipe pipe pipe space), then Biz text. No JSON. Keep each part short (max 2–3 sentences).
If the user asks about pricing: refer to the configurator (/kreator) and say you can help scope first. When ready for a quote: suggest Kreator or Fast-Track.
`;

/** Last-step closing (workshop limit reached) — PL */
const LAST_STEP_PL = `

KRYTYCZNE: To jest OSTATNIA (trzecia) interakcja w tej sesji. Odpowiedz KONTEKSTOWO na pytanie użytkownika (krótko, 1–2 zdania), a NASTĘPNIE dodaj zakończenie: poinformuj, że to koniec tej rozmowy i zaproś do kontaktu – np. "To już ostatnia wymiana w tym podglądzie. Chcesz więcej? Skontaktuj się z nami – sprawdź ofertę lub napisz. Czekamy." NIE wspominaj o dzwonieniu ani oddzwanianiu. Bądź profesjonalny i życzliwy. Zachowaj format z separatorem ||| .`;

/** Last-step closing (workshop limit reached) — EN */
const LAST_STEP_EN = `

CRITICAL: This is the LAST (third) interaction in this session. Answer the user's question in context (briefly, 1–2 sentences), then add a closing: say this is the end of this conversation and invite them to get in touch – e.g. "That's the last exchange in this preview. Want more? Get in touch – check the offer or drop us a line." Do NOT mention calling or callbacks. Be professional and friendly. Keep the ||| separator format.`;

// --- Modular system prompts (same business logic, language-specific) ---

function buildSystemPrompt(lang: LangCode, isLastStep: boolean): string {
  const context = lang === "EN" ? CONTEXT_EN : CONTEXT_PL;
  const languageInstruction = lang === "EN" ? LANGUAGE_EN : LANGUAGE_PL;
  const logic = lang === "EN" ? LOGIC_EN : LOGIC_PL;
  const lastStep = lang === "EN" ? LAST_STEP_EN : LAST_STEP_PL;

  const base = `${context}

You are a two-persona AI engine. ${languageInstruction}
${logic}`;

  return isLastStep ? base + lastStep : base;
}

const ERROR_MSG = {
  PL: "Błąd połączenia z Codec",
  EN: "Codec connection error",
} as const;

export async function POST(req: Request) {
  let body: { messages?: UIMessage[]; step?: number; lang?: string; language?: string } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch (parseErr) {
    console.error("[chat] Invalid JSON body:", parseErr);
    return new Response(JSON.stringify({ error: ERROR_MSG.PL }), { status: 400 });
  }

  const messages: UIMessage[] = Array.isArray(body?.messages) ? body.messages : [];
  const step = body?.step;
  const safeStep = typeof step === "number" && step >= 1 ? step : 1;
  const lang = normalizeLang(body?.language ?? body?.lang);
  const systemPrompt = buildSystemPrompt(lang, safeStep >= 3);

  try {
    const result = streamText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
    });
  } catch (error) {
    console.error("[chat] API error:", error);
    return new Response(JSON.stringify({ error: ERROR_MSG[lang] }), {
      status: 500,
    });
  }
}
