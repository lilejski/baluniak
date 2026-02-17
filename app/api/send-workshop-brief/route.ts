import { NextResponse } from "next/server";
import { Resend } from "resend";

const FROM = "Łukasz Baluniak <lukasz@baluniak.com>";
const TO = "lukasz@baluniak.com";

type Body = { email: string; summary?: string };

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br>");
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const email = (body.email ?? "").trim();
    if (!email) {
      return NextResponse.json({ error: "Email jest wymagany." }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Konfiguracja email nie jest ustawiona." }, { status: 500 });
    }

    const summary = (body.summary ?? "").trim() || "Brak treści.";
    const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;font-family:system-ui,sans-serif;background:#18181b;color:#e4e4e7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;padding:24px;">
    <tr><td style="padding:0 0 16px;font-size:18px;font-weight:700;color:#10b981;">Brief z Warsztatu</td></tr>
    <tr><td style="padding:8px 0;font-size:12px;color:#71717a;">Wysłano do: ${escapeHtml(email)}</td></tr>
    <tr><td style="padding:16px 0;font-size:14px;line-height:1.6;border-top:1px solid #27272a;margin-top:16px;">${escapeHtml(summary)}</td></tr>
    <tr><td style="padding:24px 0 0;font-size:12px;color:#71717a;">Warsztat · baluniak.com</td></tr>
  </table>
</body></html>`.trim();

    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Brief z Warsztatu – Baluniak",
      html,
      replyTo: email,
    });

    if (error) {
      console.error("[send-workshop-brief]", error);
      return NextResponse.json({ error: error.message ?? "Nie udało się wysłać." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[send-workshop-brief]", err);
    return NextResponse.json({ error: "Nie udało się wysłać." }, { status: 500 });
  }
}
