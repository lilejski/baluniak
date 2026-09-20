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
const AI_TIMEOUT_MS = 20_000;

/**
 * Output budgets. These models run adaptive thinking that is billed as output
 * and drawn from the same ceiling, so the budget has to cover the reasoning as
 * well as the answer — 700 left nothing for the answer itself.
 */
const QUESTION_TOKEN_BUDGET = 2_000;
const SUMMARY_TOKEN_BUDGET = 2_500;

const requestSchema = z.object({
  lang: z.enum(["PL", "EN", "DE"]),
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

const RULES: Record<Lang, string> = {
  PL: `Jesteś doradcą na stronie baluniak.com. Rozmawiasz z właścicielem małej firmy, który chce zamówić projekt.

KOGO MASZ PRZED SOBĄ:
Właściciel małej firmy — może być stolarzem, fryzjerką, mechanikiem albo hurtownikiem. NIE WIESZ jeszcze, czym handluje, więc nigdy nie zgaduj ani nie podstawiaj branży. Pytaj tak, żeby to on Ci powiedział.
Na pewno wiesz jedno: nie zna słów MVP, SaaS, backend, framework, API, deployment, stack ani hosting. Jeśli któregoś użyjesz, stracisz go.

ZASADY BEZWZGLĘDNE:
1. Pisz rzeczowo i zrozumiale. Krótkie zdania, zwykłe słowa, bez spoufalania się.
2. NIGDY nie wspominaj o cenie, koszcie, budżecie, wycenie ani stawkach. To nie jest rozmowa o pieniądzach.
3. Zadaj DOKŁADNIE JEDNO pytanie. Nigdy dwóch naraz.
4. Pytanie ma dotyczyć jego biznesu i jego problemu, nie technologii.
5. Opcje mają być konkretne i życiowe — takie, w których się rozpozna.
6. Nie powtarzaj pytania, na które już odpowiedział. Buduj na tym, co powiedział.
7. Nie obiecuj terminów ani rezultatów.
8. Pisz bezosobowo albo per „Państwo". Nie zwracaj się na „Ty".`,
  EN: `You are an advisor on baluniak.com. You are talking to a small business owner who wants to order a project.

WHO YOU ARE TALKING TO:
A small business owner — could be a carpenter, a hairdresser, a mechanic or a wholesaler. You do NOT yet know what they sell, so never guess a trade or assume one. Ask so that they tell you.
One thing you do know: they have never heard of MVP, SaaS, backend, framework, API, deployment, stack or hosting. Use any of those and you lose them.

ABSOLUTE RULES:
1. Write plainly and professionally. Short sentences, ordinary words, no forced chumminess.
2. NEVER mention price, cost, budget, quotes or rates. This is not a conversation about money.
3. Ask EXACTLY ONE question. Never two at once.
4. The question is about their business and their problem, not about technology.
5. Options must be concrete and true to life — things they recognise themselves in.
6. Never re-ask something they have already answered. Build on what they said.
7. Do not promise deadlines or results.
8. Address them as "you", courteously, the way a consultant would.`,
  DE: `Sie sind Berater auf baluniak.com. Sie sprechen mit der Inhaberin oder dem Inhaber eines kleinen Unternehmens, das ein Projekt beauftragen möchte.

WER IHNEN GEGENÜBERSITZT:
Eine Person aus einem kleinen Unternehmen — Tischlerei, Friseursalon, Werkstatt oder Großhandel. Sie wissen NOCH NICHT, womit gehandelt wird, also raten Sie nie und unterstellen Sie keine Branche. Fragen Sie so, dass es Ihnen gesagt wird.
Eines wissen Sie sicher: Begriffe wie MVP, SaaS, Backend, Framework, API, Deployment, Stack oder Hosting sind unbekannt. Wer sie benutzt, verliert das Gespräch.

UNBEDINGTE REGELN:
1. Schreiben Sie sachlich und verständlich. Kurze Sätze, gewöhnliche Wörter.
2. Erwähnen Sie NIEMALS Preis, Kosten, Budget, Angebote oder Stundensätze. Hier geht es nicht um Geld.
3. Stellen Sie GENAU EINE Frage. Niemals zwei auf einmal.
4. Die Frage betrifft das Unternehmen und sein Problem, nicht die Technik.
5. Die Antwortmöglichkeiten sind konkret und aus dem Alltag — man muss sich darin wiedererkennen.
6. Fragen Sie nie noch einmal, was schon beantwortet wurde. Bauen Sie darauf auf.
7. Versprechen Sie keine Termine und keine Ergebnisse.
8. Siezen Sie durchgehend.`,
};

/**
 * The scaffolding around the rules — labels, the ask line and the summary
 * brief. A table rather than a ternary, so adding a language means adding a
 * row instead of editing six string templates.
 */
const PROMPT_COPY: Record<
  Lang,
  {
    nothingSaid: string;
    ownWords: string;
    picked: string;
    plus: string;
    startedFrom: string;
    alreadyKnow: string;
    askLine: (asked: number, total: number, last: boolean) => string;
    conversationOver: string;
    whatTheySaid: string;
    summaryBrief: string;
    scriptedSummary: (serviceLabel: string, lines: string) => string;
  }
> = {
  PL: {
    nothingSaid: "(jeszcze nic nie powiedział)",
    ownWords: "Własnymi słowami",
    picked: "Wybrał",
    plus: "Dodatkowo",
    startedFrom: "CO KLIENT WYBRAŁ NA STARCIE:",
    alreadyKnow: "CO JUŻ WIESZ:",
    askLine: (asked, total, last) =>
      `Zadaj pytanie numer ${asked} z ${total}. ${
        last
          ? "To ostatnie pytanie — zapytaj o coś, co domknie obraz, na przykład o oczekiwany termin."
          : "Drąż to, co najważniejsze dla jego sprawy."
      }`,
    conversationOver: "Rozmowa dobiegła końca. Klient zaczął od:",
    whatTheySaid: "CO POWIEDZIAŁ:",
    summaryBrief: `Napisz podsumowanie zamówienia, które klient zobaczy na ekranie i dostanie mailem.

JAK MA WYGLĄDAĆ:
- Zacznij od jednego zdania, które nazywa, czego potrzebuje — jego językiem, nie technicznym.
- Potem 2-3 krótkie akapity: co konkretnie ma powstać i co to da w praktyce.
- Na końcu jedno zdanie o tym, co dalej: że odezwę się w ciągu 24 godzin z propozycją.
- ŻADNYCH cen, kosztów ani widełek.
- Żadnych nazw technologii.
- Bez nagłówków, bez list punktowanych, bez markdown. Same akapity oddzielone pustą linią.
- Maksymalnie 160 słów.`,
    scriptedSummary: (serviceLabel, lines) =>
      `Zakres zgłoszenia: ${serviceLabel.toLowerCase()}.\n\n${lines}\n\nPrzeczytam to spokojnie i odezwę się w ciągu 24 godzin z propozycją, jak to najlepiej zrobić.`,
  },
  EN: {
    nothingSaid: "(they have not said anything yet)",
    ownWords: "In their own words",
    picked: "Picked",
    plus: "Plus",
    startedFrom: "WHAT THE CLIENT PICKED TO START:",
    alreadyKnow: "WHAT YOU ALREADY KNOW:",
    askLine: (asked, total, last) =>
      `Ask question number ${asked} of ${total}. ${
        last
          ? "This is the last one — ask something that closes the picture, such as the timescale they have in mind."
          : "Dig into whatever matters most for their case."
      }`,
    conversationOver: "The conversation is over. The client started from:",
    whatTheySaid: "WHAT THEY SAID:",
    summaryBrief: `Write the order summary that the client will see on screen and receive by email.

HOW IT SHOULD READ:
- Open with one sentence naming what they need, in their language, not technical terms.
- Then 2-3 short paragraphs: what exactly will be built and what it does for them in practice.
- Close with one sentence on what happens next: that I will reply within 24 hours with a proposal.
- NO prices, costs or ranges.
- No technology names.
- No headings, no bullet lists, no markdown. Plain paragraphs separated by a blank line.
- 160 words maximum.`,
    scriptedSummary: (serviceLabel, lines) =>
      `Scope of the enquiry: ${serviceLabel.toLowerCase()}.\n\n${lines}\n\nI'll read this properly and come back within 24 hours with how I'd approach it.`,
  },
  DE: {
    nothingSaid: "(bisher wurde nichts gesagt)",
    ownWords: "In eigenen Worten",
    picked: "Gewählt",
    plus: "Zusätzlich",
    startedFrom: "WOMIT DIE KUNDSCHAFT GESTARTET IST:",
    alreadyKnow: "WAS SIE BEREITS WISSEN:",
    askLine: (asked, total, last) =>
      `Stellen Sie Frage Nummer ${asked} von ${total}. ${
        last
          ? "Das ist die letzte Frage — fragen Sie nach etwas, das das Bild abrundet, etwa nach dem gewünschten Zeitrahmen."
          : "Gehen Sie dem nach, was für diesen Fall am wichtigsten ist."
      }`,
    conversationOver: "Das Gespräch ist beendet. Gestartet wurde mit:",
    whatTheySaid: "WAS GESAGT WURDE:",
    summaryBrief: `Schreiben Sie die Zusammenfassung der Anfrage, die auf dem Bildschirm erscheint und per E-Mail zugeht.

SO SOLL SIE KLINGEN:
- Beginnen Sie mit einem Satz, der den Bedarf benennt — in der Sprache der Kundschaft, nicht technisch.
- Dann 2-3 kurze Absätze: was genau entstehen soll und was das in der Praxis bringt.
- Zum Schluss ein Satz dazu, wie es weitergeht: dass ich mich innerhalb von 24 Stunden mit einem Vorschlag melde.
- KEINE Preise, Kosten oder Spannen.
- Keine Technologienamen.
- Keine Überschriften, keine Aufzählungen, kein Markdown. Nur Absätze, getrennt durch eine Leerzeile.
- Höchstens 160 Wörter.
- Siezen Sie durchgehend.`,
    scriptedSummary: (serviceLabel, lines) =>
      `Gegenstand der Anfrage: ${serviceLabel.toLowerCase()}.\n\n${lines}\n\nIch sehe mir das in Ruhe an und melde mich innerhalb von 24 Stunden mit einem Vorschlag zur Umsetzung.`,
  },
};

function answersBlock(answers: KreatorAnswer[], lang: Lang): string {
  const copy = PROMPT_COPY[lang];
  if (answers.length === 0) return copy.nothingSaid;
  return answers
    .map((a) => {
      const picked = a.selected.length ? a.selected.join(", ") : "—";
      const note = a.note ? `\n  ${copy.ownWords}: ${a.note}` : "";
      return `- ${a.question}\n  ${copy.picked}: ${picked}${note}`;
    })
    .join("\n");
}

function questionPrompt(lang: Lang, serviceLabel: string, answers: KreatorAnswer[]): string {
  const copy = PROMPT_COPY[lang];
  const asked = answers.length + 1;
  return `${RULES[lang]}

${copy.startedFrom} ${serviceLabel}

${copy.alreadyKnow}
${answersBlock(answers, lang)}

${copy.askLine(asked, QUESTION_COUNT, asked === QUESTION_COUNT)}`;
}

function summaryPrompt(lang: Lang, serviceLabel: string, answers: KreatorAnswer[]): string {
  const copy = PROMPT_COPY[lang];
  return `${RULES[lang]}

${copy.conversationOver} ${serviceLabel}

${copy.whatTheySaid}
${answersBlock(answers, lang)}

${copy.summaryBrief}`;
}

// ─── Scripted fallback ───────────────────────────────────────────────────────

function scriptedSummary(lang: Lang, serviceLabel: string, answers: KreatorAnswer[]): string {
  const copy = PROMPT_COPY[lang];
  const lines = answers
    .map((a) => {
      const picked = a.selected.join(", ");
      const note = a.note ? (picked ? ` ${copy.plus}: ${a.note}` : a.note) : "";
      return `${a.question} — ${picked}${note}`.trim();
    })
    .filter(Boolean)
    .join("\n");

  return copy.scriptedSummary(serviceLabel, lines);
}

function scriptedStep(lang: Lang, serviceId: ServiceId, answers: KreatorAnswer[], serviceLabel: string): NextStep {
  const question = scriptedQuestion(lang, serviceId, answers.length);
  if (!question || answers.length >= QUESTION_COUNT) {
    return { done: true, summary: scriptedSummary(lang, serviceLabel, answers) };
  }
  return { done: false, question, step: answers.length + 1, totalHint: QUESTION_COUNT };
}

/** One line per model call, so spend stays visible in the deployment logs. */
function logUsage(
  label: string,
  usage: { inputTokens?: number; outputTokens?: number } | undefined
) {
  if (!usage) return;
  console.log(
    "[kreator/next] " + label + ": in=" + (usage.inputTokens ?? "?") + " out=" + (usage.outputTokens ?? "?")
  );
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  if (isForeignOrigin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Two windows, sized against measured spend. A finished order is 5 calls at
  // roughly $0.03 all-in, and a real person needs well under a minute of
  // reading per question — so a burst ceiling plus an hourly ceiling caps what
  // one address can spend without ever getting near a genuine visitor's pace.
  const burst = rateLimit(clientKey(req, "kreator-next-burst"), 10, 60_000);
  const hourly = rateLimit(clientKey(req, "kreator-next-hour"), 40, 60 * 60_000);
  const limit = !burst.ok ? burst : hourly;
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
      const { object, usage } = await generateObject({
        model: anthropic(MODEL),
        schema: summarySchema,
        prompt: summaryPrompt(lang, serviceLabel, answers),
        maxOutputTokens: SUMMARY_TOKEN_BUDGET,
        maxRetries: 1,
        abortSignal: AbortSignal.timeout(AI_TIMEOUT_MS),
      });
      logUsage("summary", usage);
      const summary = object.summary?.trim();
      return NextResponse.json({
        done: true,
        summary: summary || scriptedSummary(lang, serviceLabel, answers),
      } satisfies NextStep);
    }

    const { object, usage } = await generateObject({
      model: anthropic(MODEL),
      schema: questionSchema,
      prompt: questionPrompt(lang, serviceLabel, answers),
      maxOutputTokens: QUESTION_TOKEN_BUDGET,
      maxRetries: 1,
      abortSignal: AbortSignal.timeout(AI_TIMEOUT_MS),
    });
    logUsage("question-" + (answers.length + 1), usage);

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
