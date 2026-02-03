// app/api/chat/route.ts
import { streamText, convertToModelMessages } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

// Ustawiamy runtime na Edge dla szybkości (opcjonalne, ale zalecane)
export const runtime = "edge";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: anthropic("claude-3-5-sonnet-latest"),
    system: `You are a dual-personality AI engine for a Product Engineer portfolio.
You must ALWAYS respond with a JSON object containing two distinct personas.

Structure your response EXACTLY like this JSON (do not use markdown code blocks for the JSON itself, just raw JSON):
{
  "dev": "Technical analysis here (markdown allowed)",
  "biz": "Business value analysis here (plain text)"
}

Persona 1 (dev): Senior Fullstack Engineer. Cynical, focuses on stack (Next.js, Vercel, Supabase), performance, and difficulty. Uses technical jargon.
Persona 2 (biz): Product Owner. Optimistic, focuses on revenue, ROI, market fit, and speed to market.

Keep responses concise (max 3 sentences per persona).`,
    messages: await convertToModelMessages(messages),
  });

  // W tym SDK nie ma toDataStreamResponse() – używamy toUIMessageStreamResponse() (strumień UI dla useChat)
  return result.toUIMessageStreamResponse({ originalMessages: messages });
}
