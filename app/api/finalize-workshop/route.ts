import { NextResponse } from "next/server";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { Resend } from "resend";

const FROM = "onboarding@resend.dev";
const LEAD_EMAIL = "l.baluniak@gmail.com";

type ChatEntry = { role: string; content: string };

type Body = {
  chatHistory?: ChatEntry[];
  userEmail?: string;
  userContactInfo?: Record<string, string>;
};

const SYSTEM_PROMPT = `You are a Senior Project Manager. Analyze the attached conversation between the User and the Agents (DEV & BIZ).

Summarize the project into a structured Brief. Output valid HTML only (no markdown, no \`\`\`). Use this structure:

1. <h3>Project Goal</h3> + one short paragraph
2. <h3>Technical Requirements</h3> + bullet list (from DEV)
3. <h3>Business Goals</h3> + bullet list (from BIZ)
4. <h3>Recommended Next Steps</h3> + ordered list

Use <p>, <ul>, <ol>, <li>. Keep it concise and professional. If something is missing from the conversation, write "To be clarified." for that section.`;

function buildConversationText(chatHistory: ChatEntry[]): string {
  return chatHistory
    .map((m) => {
      const label = m.role === "user" ? "User" : m.role === "assistant" ? "Agents (DEV & BIZ)" : m.role;
      return `[${label}]\n${(m.content || "").trim()}`;
    })
    .join("\n\n");
}

function countUserMessages(chatHistory: ChatEntry[]): number {
  return chatHistory.filter((m) => m.role === "user" && (m.content || "").trim().length > 0).length;
}

function wrapEmailHtml(htmlBody: string, userEmail: string): string {
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;font-family:system-ui,sans-serif;background:#18181b;color:#e4e4e7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;padding:24px;">
    <tr><td style="padding:0 0 16px;font-size:18px;font-weight:700;color:#10b981;">Podsumowanie Warsztatu AI</td></tr>
    <tr><td style="padding:8px 0 16px;font-size:12px;color:#71717a;">Wysłano do: ${userEmail}</td></tr>
    <tr><td style="padding:16px 0;font-size:14px;line-height:1.6;border-top:1px solid #27272a;">${htmlBody}</td></tr>
    <tr><td style="padding:24px 0 0;font-size:12px;color:#71717a;">Warsztat · baluniak.com</td></tr>
  </table>
</body></html>`.trim();
}

function getProjectIdeaForSubject(chatHistory: ChatEntry[]): string {
  const firstUser = chatHistory.find((m) => m.role === "user" && (m.content || "").trim());
  const text = (firstUser?.content || "").trim().slice(0, 50);
  return text ? text.replace(/\n/g, " ") + (text.length >= 50 ? "…" : "") : "Warsztat";
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const chatHistory = Array.isArray(body.chatHistory) ? body.chatHistory : [];
    const userEmail = (body.userEmail ?? "").trim();
    const userContactInfo = body.userContactInfo ?? {};

    if (!userEmail) {
      return NextResponse.json({ error: "Email jest wymagany." }, { status: 400 });
    }

    const userMessageCount = countUserMessages(chatHistory);
    if (userMessageCount < 3) {
      return NextResponse.json(
        { error: "Potrzebujemy co najmniej 3 wiadomości od Ciebie, aby wygenerować Brief." },
        { status: 400 }
      );
    }

    const conversationText = buildConversationText(chatHistory);
    const userPrompt = `Conversation:\n\n${conversationText}\n\nOutput the structured Brief as HTML only.`;

    const { text: htmlBrief } = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
    });

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("[finalize-workshop] Missing RESEND_API_KEY");
      return NextResponse.json(
        { error: "Konfiguracja email nie jest ustawiona." },
        { status: 500 }
      );
    }

    const subject = `Podsumowanie Warsztatu AI: ${getProjectIdeaForSubject(chatHistory)}`;
    const fullHtml = wrapEmailHtml(htmlBrief.trim() || "<p>Brak wygenerowanej treści.</p>", userEmail);

    const resend = new Resend(apiKey);

    const toList = [userEmail, LEAD_EMAIL].filter((e) => e);
    const { error } = await resend.emails.send({
      from: FROM,
      to: toList,
      subject,
      html: fullHtml,
      replyTo: LEAD_EMAIL,
    });

    if (error) {
      console.error("[finalize-workshop] Resend error:", error);
      return NextResponse.json(
        { error: error.message ?? "Nie udało się wysłać Briefu." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[finalize-workshop]", err);
    return NextResponse.json(
      { error: "Nie udało się wygenerować lub wysłać Briefu. Spróbuj ponownie." },
      { status: 500 }
    );
  }
}
