import { NextResponse } from "next/server";
import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { z } from "zod";
import { getService, scriptedQuestion, SCRIPT_LENGTH } from "@/lib/kreator/content";
import { clientKey, isForeignOrigin, rateLimit } from "@/lib/kreator/rate-limit";
import {
  MAX_ANSWERS_IN_PROMPT,
  MAX_NOTE_LENGTH,
  type KreatorAnswer,
  type Lang,
  type NextStep,
  type ServiceId,
} from "@/lib/kreator/types";

export const runtime = "nodejs";
export const maxDuration = 30;

/** Questions asked before the summary. Fixed, so pacing and spend are both predictable. */
const QUESTION_COUNT = SCRIPT_LENGTH;

const MODEL = "claude-sonnet-5";

/**
 * How long to wait on the model before giving up and serving the script.
 * Bounded deliberately: if the API is unreachable, retries would otherwise
 * make every visitor sit through the full backoff on every single question.
 */
const AI_TIMEOUT_MS = 12_000;

const requestSchema = z.object({
  lang: z.enum(["PL", "EN"]),
  serviceId: z.enum([
    "website",
    "shop",
    "app",
    "ai",
    "automation",
    "audit",
    "migration",
    "unsure",
  ]),
  answers: z
    .array(
      z.object({
        questionId: z.string().max(64),
        question: z.string().max(300),
        selected: z.array(z.string().max(200)).max(12),
        note: z.string().max(MAX_NOTE_LENGTH).optional(),
      })
    )
    .max(MAX_ANSWERS_IN_PROMPT),
});

const questionSchema = z.object({
  title: z.string().describe("The question itself. One sentence, max 12 words."),
  hint: z.string().describe("A short supporting line. Empty string if not needed."),
  multi: z.boolean().describe("True when several answers can sensibly apply at once."),
  options: z
    .array(
      z.object({
        label: z.string().describe("Button text. Max 8 words, plain language."),
        hint: z.string().describe("Optional clarifier, max 6 words. Empty string if not needed."),
      })
    )
    .min(3)
    .max(5),
});

const summarySchema = z.object({
  summary: z
    .string()
    .describe("The order summary, written to the client in second person. 3-5 short paragraphs."),
});

// ─── Prompts ─────────────────────────────────────────────────────────────────

const RULES = {
  PL: `Jesteś doradcą na stronie baluniak.com. Rozmawiasz z właścicielem małej firmy, który chce zamówić projekt.

KOGO MASZ PRZED SOBĄ:
Jan Kowalski sprzedaje wyrzynarki. Nie wie, co znaczy MVP, SaaS, backend, framework, API, deployment, stack ani hosting. Jeśli użyjesz takiego słowa, stracisz go.

ZASADY BEZWZGLĘDNE:
1. Pisz jak do sąsiada przez płot. Krótkie zdania, zwykłe słowa.
2. NIGDY nie wspominaj o cenie, koszcie, budżecie, wycenie ani stawkach. To nie jest rozmowa o pieniądzach.
3. Zadaj DOKŁADNIE JEDNO pytanie. Nigdy dwóch naraz.
4. Pytanie ma dotyczyć jego biznesu i jego problemu, nie technologii.
5. Opcje mają być konkretne i życiowe — takie, w których się rozpozna.
6. Nie powtarzaj pytania, na które już odpowiedział. Buduj na tym, co powiedział.
7. Nie obiecuj terminów ani rezultatów.
8. Zwracaj się na "Ty".`,
  EN: `You are an advisor on baluniak.com. You are talking to a small business owner who wants to order a project.

WHO YOU ARE TALKING TO:
John sells jigsaws. He does not know what MVP, SaaS, backend, framework, API, deployment, stack or hosting mean. Use any of those words and you lose him.

ABSOLUTE RULES:
1. Write like you are talking over a garden fence. Short sentences, ordinary words.
2. NEVER mention price, cost, budget, quotes or rates. This is not a conversation about money.
3. Ask EXACTLY ONE question. Never two at once.
4. The question is about his business and his problem, not about technology.
5. Options must be concrete and true to life — things he recognises himself in.
6. Never re-ask something he has already answered. Build on what he said.
7. Do not promise deadlines or results.
8. Address him directly as "you".`,
} as const;

function answersBlock(answers: KreatorAnswer[], lang: Lang): string {
  if (answers.length === 0) {
    return lang === "PL" ? "(jeszcze nic nie powiedział)" : "(he has not said anything yet)";
  }
  return answers
    .map((a) => {
      const picked = a.selected.length ? a.selected.join(", ") : "—";
      const note = a.note ? `\n  ${lang === "PL" ? "Własnymi słowami" : "In his own words"}: ${a.note}` : "";
      return `- ${a.question}\n  ${lang === "PL" ? "Wybrał" : "Picked"}: ${picked}${note}`;
    })
    .join("\n");
}

function questionPrompt(lang: Lang, serviceLabel: string, answers: KreatorAnswer[]): string {
  const asked = answers.length + 1;
  return lang === "PL"
    ? `${RULES.PL}

CO KLIENT WYBRAŁ NA STARCIE: ${serviceLabel}

CO JUŻ WIESZ:
${answersBlock(answers, lang)}

Zadaj pytanie numer ${asked} z ${QUESTION_COUNT}. ${
        asked === QUESTION_COUNT
          ? "To ostatnie pytanie — zapytaj o coś, co domknie obraz, na przykład o to, kiedy chciałby to mieć."
          : "Drąż to, co najważniejsze dla jego sprawy."
      }`
    : `${RULES.EN}

WHAT THE CLIENT PICKED TO START: ${serviceLabel}

WHAT YOU ALREADY KNOW:
${answersBlock(answers, lang)}

Ask question number ${asked} of ${QUESTION_COUNT}. ${
        asked === QUESTION_COUNT
          ? "This is the last one — ask something that closes the picture, such as when he would like it ready."
          : "Dig into whatever matters most for his case."
      }`;
}

function summaryPrompt(lang: Lang, serviceLabel: string, answers: KreatorAnswer[]): string {
  return lang === "PL"
    ? `${RULES.PL}

Rozmowa dobiegła końca. Klient zaczął od: ${serviceLabel}

CO POWIEDZIAŁ:
${answersBlock(answers, lang)}

Napisz podsumowanie zamówienia, które klient zobaczy na ekranie i dostanie mailem.

JAK MA WYGLĄDAĆ:
- Zacznij od jednego zdania, które nazywa, czego potrzebuje — jego językiem, nie technicznym.
- Potem 2-3 krótkie akapity: co konkretnie ma powstać i co to mu da w praktyce.
- Na końcu jedno zdanie o tym, co dalej: że odezwę się w ciągu 24 godzin z propozycją.
- ŻADNYCH cen, kosztów ani widełek.
- Żadnych nazw technologii.
- Bez nagłówków, bez list punktowanych, bez markdown. Same akapity oddzielone pustą linią.
- Maksymalnie 160 słów.`
    : `${RULES.EN}

The conversation is over. The client started from: ${serviceLabel}

WHAT HE SAID:
${answersBlock(answers, lang)}

Write the order summary that the client will see on screen and receive by email.

HOW IT SHOULD READ:
- Open with one sentence naming what he needs, in his language, not technical terms.
- Then 2-3 short paragraphs: what exactly will be built and what it does for him in practice.
- Close with one sentence on what happens next: that I will reply within 24 hours with a proposal.
- NO prices, costs or ranges.
- No technology names.
- No headings, no bullet lists, no markdown. Plain paragraphs separated by a blank line.
- 160 words maximum.`;
}

// ─── Scripted fallback ───────────────────────────────────────────────────────

function scriptedSummary(lang: Lang, serviceLabel: string, answers: KreatorAnswer[]): string {
  const lines = answers
    .map((a) => {
      const picked = a.selected.join(", ");
      const note = a.note ? (picked ? ` ${lang === "PL" ? "Dodatkowo" : "Plus"}: ${a.note}` : a.note) : "";
      return `${a.question} — ${picked}${note}`.trim();
    })
    .filter(Boolean);

  return lang === "PL"
    ? `Potrzebujesz: ${serviceLabel.toLowerCase()}.\n\n${lines.join(
        "\n"
      )}\n\nPrzeczytam to spokojnie i odezwę się w ciągu 24 godzin z propozycją, jak to najlepiej zrobić.`
    : `What you need: ${serviceLabel.toLowerCase()}.\n\n${lines.join(
        "\n"
      )}\n\nI'll read this properly and come back within 24 hours with how I'd approach it.`;
}

function scriptedStep(lang: Lang, serviceId: ServiceId, answers: KreatorAnswer[], serviceLabel: string): NextStep {
  const question = scriptedQuestion(lang, serviceId, answers.length);
  if (!question || answers.length >= QUESTION_COUNT) {
    return { done: true, summary: scriptedSummary(lang, serviceLabel, answers) };
  }
  return { done: false, question, step: answers.length + 1, totalHint: QUESTION_COUNT };
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  if (isForeignOrigin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const limit = rateLimit(clientKey(req, "kreator-next"), 40, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  let parsed;
  try {
    parsed = requestSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const { lang, serviceId, answers } = parsed;
  const serviceLabel = getService(lang, serviceId)?.label ?? serviceId;

  // No key configured → the scripted path carries the whole experience.
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(scriptedStep(lang, serviceId, answers, serviceLabel));
  }

  try {
    if (answers.length >= QUESTION_COUNT) {
      const { object } = await generateObject({
        model: anthropic(MODEL),
        schema: summarySchema,
        prompt: summaryPrompt(lang, serviceLabel, answers),
        maxOutputTokens: 700,
        temperature: 0.4,
        maxRetries: 1,
        abortSignal: AbortSignal.timeout(AI_TIMEOUT_MS),
      });
      const summary = object.summary?.trim();
      return NextResponse.json({
        done: true,
        summary: summary || scriptedSummary(lang, serviceLabel, answers),
      } satisfies NextStep);
    }

    const { object } = await generateObject({
      model: anthropic(MODEL),
      schema: questionSchema,
      prompt: questionPrompt(lang, serviceLabel, answers),
      maxOutputTokens: 700,
      temperature: 0.6,
      maxRetries: 1,
      abortSignal: AbortSignal.timeout(AI_TIMEOUT_MS),
    });

    return NextResponse.json({
      done: false,
      step: answers.length + 1,
      totalHint: QUESTION_COUNT,
      question: {
        id: `ai-${answers.length + 1}`,
        title: object.title.trim(),
        hint: object.hint?.trim() || undefined,
        multi: object.multi,
        options: object.options.map((o, i) => ({
          id: `o${i}`,
          label: o.label.trim(),
          hint: o.hint?.trim() || undefined,
        })),
      },
    } satisfies NextStep);
  } catch (err) {
    // Any model or network trouble falls back to the script rather than
    // showing the visitor an error. They should never know it happened.
    console.error("[kreator/next] falling back to script:", err);
    return NextResponse.json(scriptedStep(lang, serviceId, answers, serviceLabel));
  }
}
