import { anthropic } from "@ai-sdk/anthropic";
import { generateText, Output } from "ai";
import { z } from "zod";
import type { NextRequest } from "next/server";

const duelSchemaBase = z.object({
  agent1: z
    .string()
    .describe(
      "Technical implementation steps in Markdown: bullet points, code blocks if needed, clear steps for developers"
    ),
  agent2: z
    .string()
    .describe(
      "Business value and monetization strategy: clear paragraphs for stakeholders, revenue potential, go-to-market angles"
    ),
});

const duelSchemaWithLink = duelSchemaBase.extend({
  suggestedLink: z
    .enum(["fotarobota", "saas-guide"])
    .describe(
      "Based on conversation: 'fotarobota' if topic is images/AI/photo, 'saas-guide' if topic is building/SaaS/products"
    ),
});

function formatExchanges(
  previous: Array<{ prompt: string; agent1: string; agent2: string }>
): string {
  return previous
    .map(
      (ex, i) =>
        `--- Exchange ${i + 1} ---\nUser: ${ex.prompt}\n\nDeveloper:\n${ex.agent1.slice(0, 400)}...\n\nBusiness:\n${ex.agent2.slice(0, 400)}...`
    )
    .join("\n\n");
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const previousExchanges = Array.isArray(body?.previousExchanges)
    ? body.previousExchanges
    : [];

  if (!message) {
    return Response.json(
      { error: "Missing or empty message" },
      { status: 400 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY is not configured" },
      { status: 500 }
    );
  }

  const isThirdExchange = previousExchanges.length === 2;
  const schema = isThirdExchange ? duelSchemaWithLink : duelSchemaBase;
  const conversationContext =
    previousExchanges.length > 0
      ? `\n\n**Conversation so far:**\n${formatExchanges(previousExchanges)}\n\n**New user message:** ${message}`
      : `\n**User idea:** ${message}`;

  const promptInstructions = isThirdExchange
    ? `

This is the **final (3rd) exchange**. You must also set **suggestedLink**:
- Use "fotarobota" if the conversation is mainly about images, AI images, photo tools, or visual/AI content.
- Use "saas-guide" if the conversation is mainly about building a product, SaaS, startup, or software business.

Return valid JSON with keys "agent1", "agent2", and "suggestedLink".`
    : `

Return only valid JSON with keys "agent1" and "agent2".`;

  try {
    const { output } = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      output: Output.object({
        name: "DuelResponse",
        description: isThirdExchange
          ? "Two responses plus suggestedLink for Next Steps CTA."
          : "Two responses: Agent 1 (technical), Agent 2 (business).",
        schema,
      }),
      prompt: `You are two experts in a duel responding to the same user idea.${conversationContext}

Respond with a JSON object:

1. **agent1** (Developer/Technical persona): Write technical implementation steps in Markdown. Use bullet points, numbered steps, and code blocks where relevant. Focus on: architecture, stack choices, implementation phases, APIs, deployment. Be concrete and actionable.

2. **agent2** (Business persona): Write business value and monetization strategy in plain but polished prose. Focus on: value proposition, target market, revenue streams, pricing angles, go-to-market, KPIs. No code—stakeholder language only.

Keep each response concise but complete (roughly 150–300 words each).${promptInstructions}`,
    });

    const response: Record<string, string> = {
      agent1: output.agent1,
      agent2: output.agent2,
    };
    if (isThirdExchange && "suggestedLink" in output) {
      response.suggestedLink = output.suggestedLink as string;
    }
    return Response.json(response);
  } catch (err) {
    console.error("Chat API error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "AI request failed" },
      { status: 500 }
    );
  }
}
