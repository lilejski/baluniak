import { NextResponse } from "next/server";
import { Resend } from "resend";

const FROM = "onboarding@resend.dev";
const TO = "l.baluniak@gmail.com";

type SendContactBody = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

function contactEmailHtml(body: SendContactBody): string {
  const name = escapeHtml(body.name ?? "—");
  const email = escapeHtml(body.email ?? "—");
  const subject = escapeHtml(body.subject ?? "—");
  const message = escapeHtml((body.message ?? "").replace(/\n/g, "<br>"));
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;font-family:system-ui,sans-serif;background:#18181b;color:#e4e4e7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;padding:24px;">
    <tr><td style="padding:0 0 16px;font-size:18px;font-weight:700;color:#10b981;">Fast-Track: Nowa wiadomość</td></tr>
    <tr><td style="padding:8px 0;font-size:12px;font-weight:600;text-transform:uppercase;color:#71717a;">Nadawca</td></tr>
    <tr><td style="padding:4px 0 16px;font-size:14px;"><strong>${name}</strong> &lt;${email}&gt;</td></tr>
    <tr><td style="padding:8px 0;font-size:12px;font-weight:600;text-transform:uppercase;color:#71717a;">Temat</td></tr>
    <tr><td style="padding:4px 0 16px;font-size:14px;">${subject}</td></tr>
    <tr><td style="padding:8px 0;font-size:12px;font-weight:600;text-transform:uppercase;color:#71717a;">Wiadomość</td></tr>
    <tr><td style="padding:4px 0 16px;font-size:14px;line-height:1.6;">${message}</td></tr>
    <tr><td style="padding:24px 0 0;font-size:12px;color:#71717a;">Wysłano z formularza Fast-Track · baluniak.com</td></tr>
  </table>
</body>
</html>
  `.trim();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SendContactBody;
    const email = (body.email ?? "").trim();
    const message = (body.message ?? "").trim();
    if (!email || !message) {
      return NextResponse.json(
        { error: "Email i wiadomość są wymagane." },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("[send-contact] Missing RESEND_API_KEY");
      return NextResponse.json(
        { error: "Konfiguracja email nie jest ustawiona." },
        { status: 500 }
      );
    }

    const name = (body.name ?? "").trim() || "Nie podano";
    const subject = (body.subject ?? "").trim() || "Wiadomość z formularza";
    const emailSubject = `Fast-Track: ${subject} od ${name}.`;

    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM,
      to: TO,
      subject: emailSubject,
      html: contactEmailHtml({ name, email, subject, message: body.message }),
    });

    if (error) {
      console.error("[send-contact] Resend error:", error);
      return NextResponse.json(
        { error: error.message ?? "Nie udało się wysłać wiadomości." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[send-contact]", err);
    return NextResponse.json(
      { error: "Nie udało się wysłać wiadomości. Spróbuj ponownie lub napisz bezpośrednio." },
      { status: 500 }
    );
  }
}
