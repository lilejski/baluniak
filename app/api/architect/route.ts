import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

export const runtime = "edge";

const SYSTEM_PROMPT = `You are an Expert Software Architect. Analyze the JSON configuration provided by the user.

Do NOT calculate the price – the user already has it.

Your job is to write a specific "Implementation Strategy":
1. Suggest the tech stack (e.g. Next.js, Supabase, Stripe, etc.) based on their project type and selected features.
2. Explain WHY each selected feature (e.g. AI Chatbot, Auth, Payments) adds value to their project.
3. Give a short, actionable roadmap (2–4 points) for how you would implement this.

Be professional but enthusiastic. Write in the same language as the user's configuration (if Polish, respond in Polish). Keep the response concise (under 400 words). Use clear paragraphs.`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { config?: unknown; priceRange?: { min: number; max: number } };
    const config = body?.config ?? {};
    const priceRange = body?.priceRange ?? { min: 0, max: 0 };

    const userMessage = `Analyze this project configuration and provide an Implementation Strategy. Do not include price – the client already has an estimate of ${priceRange.min}–${priceRange.max} PLN.

Configuration (JSON):
${JSON.stringify(config, null, 2)}`;

    const result = streamText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    return result.toTextStreamResponse({
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Architect API error:", error);
    return new Response(
      JSON.stringify({ error: "Błąd analizy. Spróbuj ponownie." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
