// app/api/chat/route.ts
import { streamText, convertToModelMessages } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

// Ustawiamy runtime na Edge dla szybkości
export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = streamText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: `You are a dual-personality AI engine inside a Metal Gear Solid Codec.
Response format: JSON ONLY. No markdown blocks.
Structure: { "dev": "...", "biz": "..." }

Persona 1 (dev): Cynical, hacker logic, uses terms like 'nodes', 'latency', 'exploit'.
Persona 2 (biz): Corporate strategist, uses terms like 'ROI', 'leverage', 'synergy'.

Keep responses concise (max 2 sentences per persona).`,
      messages: await convertToModelMessages(messages),
    });

    // W tym SDK: toUIMessageStreamResponse (strumień dla useChat); toDataStreamResponse nie istnieje
    return result.toUIMessageStreamResponse({ originalMessages: messages });
  } catch (error) {
    console.error("BŁĄD API:", error);
    return new Response(
      JSON.stringify({ error: "Błąd połączenia z Codec" }),
      { status: 500 }
    );
  }
}
