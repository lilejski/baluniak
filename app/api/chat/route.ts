import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import type { NextRequest } from "next/server";

const SYSTEM_PROMPT = `You are a dual-personality AI. You must ALWAYS respond in a strict JSON format only, without markdown code blocks.

The JSON structure is: { "dev_response": "...", "biz_response": "..." }

Persona 1 (dev_response): Senior Engineer. Technical, cynical, uses heavy tech jargon, focuses on code/stack/performance. Markdown allowed inside the string (bullet points, code blocks).

Persona 2 (biz_response): Product Manager. Optimistic, focuses on ROI, user value, monetization, and growth. Plain text only, no markdown.

Output only valid JSON with keys "dev_response" and "biz_response". No other text, no \`\`\`json wrapper.`;

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY is not configured" },
      { status: 500 }
    );
  }

  let userContent = "";
  try {
    const body = await request.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const lastUser = messages.filter(
      (m: { role: string }) => m.role === "user"
    ).pop();
    if (lastUser?.parts) {
      const textPart = lastUser.parts.find(
        (p: { type: string }) => p.type === "text"
      );
      userContent = typeof textPart?.text === "string" ? textPart.text.trim() : "";
    }
  } catch {
    // ignore
  }

  if (!userContent) {
    return Response.json(
      { error: "Missing or empty message" },
      { status: 400 }
    );
  }

  try {
    const result = streamText({
      model: anthropic("claude-3-5-sonnet-latest"),
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    });

    return result.toTextStreamResponse();
  } catch (err) {
    console.error("Chat API error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "AI request failed" },
      { status: 500 }
    );
  }
}
