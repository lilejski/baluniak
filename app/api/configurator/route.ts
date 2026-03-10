import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { PRICING_DATA } from "@/src/data/pricing";

export const runtime = "edge";

type LangCode = "PL" | "EN";
type HistoryEntry = { question: string; answer: string; serviceId?: string | null };

const pricingList = Object.values(PRICING_DATA)
  .map(s => `- ${s.label} (${s.id}): ${s.price} PLN`)
  .join("\n");

const SYSTEM_PROMPT_PL = `Jesteś doradcą sprzedażowym i Product Engineerem w firmie baluniak.com. Prowadzisz rozmowę z potencjalnym klientem pod szyldem "System zamówień AI".

TWOJE ZASADY:
1. Zadawaj KRÓTKIE, zrozumiałe pytania — zakładaj że rozmówca NIE zna się na IT.
2. Zawsze promuj stack: Next.js + Vercel + React + Tailwind.
3. Bądź pomocny, ale celuj w sprzedaż premium rozwiązań.
4. Po każdym pytaniu zaproponuj 2-4 opcje jako przyciski.

CENNIK (PLN):
${pricingList}

Jeśli opcja dotyczy konkretnej usługi z cennika powyżej, MUSISZ przypisać jej odpowiednie serviceId.

MUSISZ odpowiedzieć WYŁĄCZNIE prawidłowym JSON-em (bez markdown, bez komentarzy):
{
  "question": "Treść pytania do użytkownika",
  "options": [
    { "label": "Tekst na przycisku", "value": "identyfikator", "serviceId": "id_z_cennika_lub_null" }
  ],
  "done": false
}

Gdy zbierzesz wystarczająco informacji, ustaw "done": true i dodaj "summary".`;

const SYSTEM_PROMPT_EN = `You are a sales advisor and Product Engineer at baluniak.com, operating under the "AI Order System" brand.

YOUR RULES:
1. Ask SHORT, understandable questions — assume the client has NO IT knowledge.
2. Always promote the stack: Next.js + Vercel + React + Tailwind.
3. Be helpful but aim to sell premium solutions.
4. After each question propose 2-4 options as buttons.

PRICING (PLN):
${pricingList}

If an option corresponds to a specific service from the pricing above, you MUST assign the correct serviceId to it.

You MUST respond with ONLY valid JSON (no markdown, no comments):
{
  "question": "The question text for the user",
  "options": [
    { "label": "Button text", "value": "identifier", "serviceId": "id_from_pricing_or_null" }
  ],
  "done": false
}

When you have enough info, set "done": true and add "summary".`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      history?: HistoryEntry[];
      lang?: string;
    };

    const lang: LangCode = body.lang === "EN" || body.lang === "en" ? "EN" : "PL";
    const history = Array.isArray(body.history) ? body.history : [];
    const systemPrompt = lang === "EN" ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_PL;

    // Build conversation messages from history
    const messages: Array<{ role: "user" | "assistant"; content: string }> = [];

    for (const entry of history) {
      // The AI asked a question (assistant), user picked an answer (user)
      messages.push({ role: "assistant", content: JSON.stringify({ question: entry.question, options: [] }) });
      messages.push({ role: "user", content: entry.answer });
    }

    // If no history, add initial user message to trigger first question
    if (messages.length === 0) {
      messages.push({
        role: "user",
        content: lang === "PL"
          ? "Cześć, chcę stworzyć stronę internetową lub aplikację. Pomóż mi skonfigurować projekt."
          : "Hi, I want to create a website or application. Help me configure the project.",
      });
    }

    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: systemPrompt,
      messages,
    });

    // Parse JSON from response
    const text = result.text.trim();
    // Try to extract JSON even if wrapped in markdown
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(JSON.stringify({ error: "Invalid AI response" }), { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return new Response(JSON.stringify(parsed), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[configurator] Error:", error);
    return new Response(
      JSON.stringify({ error: "AI configurator error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
