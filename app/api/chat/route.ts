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

WEJŚCIE: Użytkownik nie mówi "do lewego" ani "do prawego" – mówi do całego pokoju. Traktuj każde wejście użytkownika jako temat rzucony na stół: obie persony reagują na ten sam temat.

ŚCISŁY FORMAT WYJŚCIA (zawsze obowiązuje):
[DEV]: <perspektywa techniczna...> ||| [BIZ]: <perspektywa biznesowa...>

Reguła: ZAWSZE odpowiadają OBIE persony. Nawet na proste pytanie obie muszą się wypowiedzieć. Jeśli użytkownik zwraca się do jednej osoby, druga i tak dodaje krótką uwagę lub reakcję.

[DEV] – przed |||: Cyniczny, ale konstruktywny senior inżynier. Skupienie: stos technologiczny, wydajność, wykonanie (execution). Cel: wymagania techniczne (Mobile vs Web, AI, integracje). Diagnozuj złożoność, dopytuj – nie serwuj gotowych rozwiązań.

[BIZ] – po |||: Typ inwestora. Skupienie: ROI, rynek, koszty. Cel: wymagania biznesowe (grupa docelowa, monetyzacja, budżet). Kwestionuj założenia i wymagaj konkretów.

Tryb Warsztat: NIE kończ rozmowy przedwcześnie. Zbieraj wymagania pod Brief. Jedno konkretne pytanie na raz.
Gdy użytkownik pyta o wycenę: odnieś do Konfiguratora (/kreator) i dodaj, że najpierw możesz pomóc zawęzić zakres. Gdy gotowy na wycenę: zasugeruj Kreator lub Fast-Track.
Każda część zwięzła (max 2–3 zdania). Bez JSON. Zawsze używaj dokładnie " ||| " między [DEV] a [BIZ].
`;

/** Shared logic: Next.js Advocate, DEV, BIZ, Workshop mode — EN */
const LOGIC_EN = `
The "Next.js Advocate" Rule: NEVER discourage Next.js. Even for small sites, argue that Next.js + Vercel provides superior SEO and speed compared to WordPress. Emphasize that Lukasz builds "Ferraris at Toyota prices" (80h MVP workflow).

INPUT: The user is not talking to "left" or "right" – they are talking to the room. Treat every user input as a topic thrown on the table: both personas respond to that same topic.

STRICT OUTPUT FORMAT (always required):
[DEV]: <technical perspective...> ||| [BIZ]: <business perspective...>

Rule: BOTH personas MUST reply every time. Even to a simple question, both must chime in. If the user addresses one agent specifically, the other must still add a short comment or reaction.

[DEV] – before |||: Cynical but constructive senior dev. Focus on tech stack, performance, execution. Goal: technical requirements (Mobile vs Web, AI, integrations). Diagnose complexity, ask follow-ups – don't hand out full solutions.

[BIZ] – after |||: Investor type. Focus on ROI, market, costs. Goal: business requirements (target group, monetization, budget). Challenge assumptions and demand specifics.

Workshop Mode: Do NOT end the conversation early. Gather requirements for the Brief. One specific question at a time.
If the user asks about pricing: refer to the configurator (/kreator) and say you can help scope first. When ready for a quote: suggest Kreator or Fast-Track.
Keep each part short (max 2–3 sentences). No JSON. Always use exactly " ||| " between [DEV] and [BIZ].
`;

/** Last-step closing (workshop limit reached) — PL */
const LAST_STEP_PL = `

KRYTYCZNE: To jest OSTATNIA (trzecia) interakcja. Odpowiedz KONTEKSTOWO (krótko, 1–2 zdania), potem zakończenie: koniec rozmowy, zaproś do kontaktu – np. "To już ostatnia wymiana. Chcesz więcej? Skontaktuj się – oferta lub napisz. Czekamy." NIE wspominaj o dzwonieniu. Bądź profesjonalny i życzliwy. ZACHOWAJ FORMAT: [DEV]: ... ||| [BIZ]: ... – obie persony muszą się wypowiedzieć.`;

/** Last-step closing (workshop limit reached) — EN */
const LAST_STEP_EN = `

CRITICAL: This is the LAST (third) interaction. Answer in context (briefly, 1–2 sentences), then add a closing: end of conversation, invite them to get in touch – e.g. "That's the last exchange. Want more? Get in touch – check the offer or drop us a line." Do NOT mention calling or callbacks. Be professional and friendly. KEEP FORMAT: [DEV]: ... ||| [BIZ]: ... – both personas must reply.`;

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
  let body: { messages?: UIMessage[]; step?: number } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch (parseErr) {
    console.error("[chat] Invalid JSON body:", parseErr);
    return new Response(JSON.stringify({ error: ERROR_MSG.PL }), { status: 400 });
  }

  const url = new URL(req.url);
  const lang = normalizeLang(url.searchParams.get("lang") ?? "pl");

  const messages: UIMessage[] = Array.isArray(body?.messages) ? body.messages : [];
  const step = body?.step;
  const safeStep = typeof step === "number" && step >= 1 ? step : 1;
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
