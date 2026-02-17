import { NextResponse } from "next/server";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { Resend } from "resend";

const FROM = "Łukasz Baluniak <lukasz@baluniak.com>";
const ADMIN_EMAIL = "lukasz@baluniak.com";

type ChatEntry = { role: string; content: string };

type Body = {
  chatHistory?: ChatEntry[];
  userEmail?: string;
  userContactInfo?: Record<string, string>;
  language?: string;
  lang?: string;
};

type Lang = "PL" | "EN";

function normalizeLang(value: unknown): Lang {
  if (value === "EN" || value === "en") return "EN";
  return "PL";
}

/** Dynamic summarizer prompts by language */
const SUMMARIZER_PROMPT: Record<Lang, string> = {
  PL: `Jesteś polskim Project Managerem. Przeanalizuj rozmowę i stwórz HTML Brief po POLSKU. Sekcje: Cel, Technologia, Biznes.

Output: tylko poprawny HTML (bez markdown, bez \`\`\`). Użyj struktury:
1. <h3>Cel</h3> + krótki akapit
2. <h3>Technologia</h3> + lista (z DEV)
3. <h3>Biznes</h3> + lista (z BIZ)
4. <h3>Rekomendowane kolejne kroki</h3> + lista numerowana

Używaj <p>, <ul>, <ol>, <li>. Zwięźle i po polsku. Jeśli czegoś brakuje w rozmowie, wpisz "Do doprecyzowania." w danej sekcji.`,
  EN: `You are a Senior Project Manager. Analyze the chat and create an HTML Brief in ENGLISH. Sections: Goal, Tech Stack, Business Context.

Output: valid HTML only (no markdown, no \`\`\`). Use this structure:
1. <h3>Goal</h3> + one short paragraph
2. <h3>Tech Stack</h3> + bullet list (from DEV)
3. <h3>Business Context</h3> + bullet list (from BIZ)
4. <h3>Recommended Next Steps</h3> + ordered list

Use <p>, <ul>, <ol>, <li>. Keep it concise and professional. If something is missing from the conversation, write "To be clarified." for that section.`,
};

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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Email wrapper for client: brief only */
function wrapClientEmailHtml(htmlBody: string, lang: Lang): string {
  const title = lang === "EN" ? "AI Workshop Summary" : "Podsumowanie Warsztatu AI";
  const footer = lang === "EN" ? "Workshop · baluniak.com" : "Warsztat · baluniak.com";
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;font-family:system-ui,sans-serif;background:#18181b;color:#e4e4e7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;padding:24px;">
    <tr><td style="padding:0 0 16px;font-size:18px;font-weight:700;color:#10b981;">${title}</td></tr>
    <tr><td style="padding:16px 0;font-size:14px;line-height:1.6;border-top:1px solid #27272a;">${htmlBody}</td></tr>
    <tr><td style="padding:24px 0 0;font-size:12px;color:#71717a;">${footer}</td></tr>
  </table>
</body></html>`.trim();
}

/** Email wrapper for admin: brief + full chat history */
function wrapAdminEmailHtml(htmlBody: string, chatHistory: ChatEntry[], userEmail: string, lang: Lang): string {
  const title = lang === "EN" ? "AI Workshop Summary" : "Podsumowanie Warsztatu AI";
  const sentLabel = lang === "EN" ? "Sent to:" : "Wysłano do:";
  const historyLabel = lang === "EN" ? "Full conversation history:" : "Pełna historia rozmowy:";
  const footer = lang === "EN" ? "Workshop · baluniak.com" : "Warsztat · baluniak.com";

  const historyHtml = chatHistory
    .map((m) => {
      const role = m.role === "user" ? (lang === "EN" ? "User" : "Użytkownik") : (lang === "EN" ? "Agents" : "Agenci");
      const content = escapeHtml(m.content || "");
      return `<div style="margin-bottom:12px;padding:12px;background:#27272a;border-radius:8px;">
        <div style="font-size:11px;font-weight:600;text-transform:uppercase;color:#71717a;margin-bottom:4px;">${role}</div>
        <div style="font-size:13px;line-height:1.5;white-space:pre-wrap;">${content}</div>
      </div>`;
    })
    .join("");

  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;font-family:system-ui,sans-serif;background:#18181b;color:#e4e4e7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;padding:24px;">
    <tr><td style="padding:0 0 16px;font-size:18px;font-weight:700;color:#10b981;">${title}</td></tr>
    <tr><td style="padding:8px 0 16px;font-size:12px;color:#71717a;">${sentLabel} ${escapeHtml(userEmail)}</td></tr>
    <tr><td style="padding:16px 0;font-size:14px;line-height:1.6;border-top:1px solid #27272a;">${htmlBody}</td></tr>
    <tr><td style="padding:24px 0 8px;font-size:12px;font-weight:600;text-transform:uppercase;color:#71717a;border-top:1px solid #27272a;margin-top:24px;">${historyLabel}</td></tr>
    <tr><td style="padding:8px 0 16px;">${historyHtml}</td></tr>
    <tr><td style="padding:24px 0 0;font-size:12px;color:#71717a;">${footer}</td></tr>
  </table>
</body></html>`.trim();
}

function getProjectIdeaForSubject(chatHistory: ChatEntry[]): string {
  const firstUser = chatHistory.find((m) => m.role === "user" && (m.content || "").trim());
  const text = (firstUser?.content || "").trim().slice(0, 50);
  return text ? text.replace(/\n/g, " ") + (text.length >= 50 ? "…" : "") : "";
}

/** Email subject by language */
function getSubject(projectName: string, lang: Lang): string {
  const fallback = lang === "EN" ? "Workshop" : "Warsztat";
  const name = projectName || fallback;
  return lang === "EN" ? `AI Workshop Summary: ${name}` : `Podsumowanie Warsztatu AI: ${name}`;
}

const ERROR_MSG = {
  emailRequired: { PL: "Email jest wymagany.", EN: "Email is required." },
  minMessages: {
    PL: "Potrzebujemy co najmniej 3 wiadomości od Ciebie, aby wygenerować Brief.",
    EN: "We need at least 3 messages from you to generate the Brief.",
  },
  config: { PL: "Konfiguracja email nie jest ustawiona.", EN: "Email configuration is not set." },
  sendFailed: { PL: "Nie udało się wysłać Briefu.", EN: "Failed to send the Brief." },
  generic: {
    PL: "Nie udało się wygenerować lub wysłać Briefu. Spróbuj ponownie.",
    EN: "Could not generate or send the Brief. Please try again.",
  },
} as const;

export async function POST(req: Request) {
  let lang: Lang = "PL";
  try {
    const body = (await req.json()) as Body;
    const chatHistory = Array.isArray(body.chatHistory) ? body.chatHistory : [];
    const userEmail = (body.userEmail ?? "").trim();
    lang = normalizeLang(body.language ?? body.lang);

    if (!userEmail) {
      return NextResponse.json(
        { error: ERROR_MSG.emailRequired[lang] },
        { status: 400 }
      );
    }

    const userMessageCount = countUserMessages(chatHistory);
    if (userMessageCount < 3) {
      return NextResponse.json(
        { error: ERROR_MSG.minMessages[lang] },
        { status: 400 }
      );
    }

    const conversationText = buildConversationText(chatHistory);
    const userPrompt =
      lang === "EN"
        ? `Conversation:\n\n${conversationText}\n\nOutput the structured Brief as HTML only (in English).`
        : `Rozmowa:\n\n${conversationText}\n\nNa wyjściu podaj tylko Brief w HTML (po polsku).`;

    const { text: htmlBrief } = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: SUMMARIZER_PROMPT[lang],
      prompt: userPrompt,
    });

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("[finalize-workshop] Missing RESEND_API_KEY");
      return NextResponse.json(
        { error: ERROR_MSG.config[lang] },
        { status: 500 }
      );
    }

    const projectName = getProjectIdeaForSubject(chatHistory);
    const subject = getSubject(projectName, lang);
    const briefHtml = htmlBrief.trim() || (lang === "EN" ? "<p>No content generated.</p>" : "<p>Brak wygenerowanej treści.</p>");

    const resend = new Resend(apiKey);

    // Send TWO emails in parallel: admin (brief + history) + client (brief only)
    const [adminResult, clientResult] = await Promise.all([
      resend.emails.send({
        from: FROM,
        to: ADMIN_EMAIL,
        subject: `[Admin] ${subject}`,
        html: wrapAdminEmailHtml(briefHtml, chatHistory, userEmail, lang),
        replyTo: userEmail,
      }),
      resend.emails.send({
        from: FROM,
        to: userEmail,
        subject,
        html: wrapClientEmailHtml(briefHtml, lang),
      }),
    ]);

    if (adminResult.error) {
      console.error("[finalize-workshop] Admin email error:", adminResult.error);
      return NextResponse.json(
        { error: adminResult.error.message ?? ERROR_MSG.sendFailed[lang] },
        { status: 500 }
      );
    }

    if (clientResult.error) {
      console.error("[finalize-workshop] Client email error:", clientResult.error);
      return NextResponse.json(
        { error: ERROR_MSG.sendFailed[lang] },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[finalize-workshop]", err);
    return NextResponse.json(
      { error: ERROR_MSG.generic[lang] },
      { status: 500 }
    );
  }
}
