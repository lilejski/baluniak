import { NextResponse } from "next/server";
import { Resend } from "resend";

const FROM = "Łukasz Baluniak <lukasz@baluniak.com>";
const ADMIN_EMAIL = "lukasz@baluniak.com";

type SendContactBody = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

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

function confirmationEmailHtml(lang: "PL" | "EN"): string {
  const text = lang === "EN"
    ? {
        title: "Message Received",
        body: "Thank you for contacting me. I've received your message and will get back to you within 24 hours.",
        footer: "Best regards,<br>Łukasz Baluniak"
      }
    : {
        title: "Wiadomość otrzymana",
        body: "Dziękuję za kontakt. Otrzymałem Twoją wiadomość i wrócę z odpowiedzią w ciągu 24h.",
        footer: "Pozdrawiam,<br>Łukasz Baluniak"
      };

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;font-family:system-ui,sans-serif;background:#18181b;color:#e4e4e7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;padding:24px;">
    <tr><td style="padding:0 0 16px;font-size:18px;font-weight:700;color:#10b981;">${text.title}</td></tr>
    <tr><td style="padding:16px 0;font-size:14px;line-height:1.6;border-top:1px solid #27272a;">${text.body}</td></tr>
    <tr><td style="padding:24px 0 0;font-size:12px;color:#71717a;">${text.footer}</td></tr>
    <tr><td style="padding:16px 0 0;font-size:11px;color:#52525b;">baluniak.com</td></tr>
  </table>
</body>
</html>
  `.trim();
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
    const emailSubject = `Nowy Lead: Kontakt – ${subject} od ${name}`;

    const resend = new Resend(apiKey);

    // Detect language from email domain or default to PL
    const lang: "PL" | "EN" = email.includes(".pl") || email.includes("pl.") ? "PL" : "EN";

    // Send TWO emails in parallel: admin notification + client confirmation
    const [adminResult, clientResult] = await Promise.all([
      resend.emails.send({
        from: FROM,
        to: ADMIN_EMAIL,
        subject: emailSubject,
        html: contactEmailHtml({ name, email, subject, message }),
        replyTo: email,
      }),
      resend.emails.send({
        from: FROM,
        to: email,
        subject: lang === "EN" ? "Confirmation: Message Received" : "Potwierdzenie otrzymania zgłoszenia",
        html: confirmationEmailHtml(lang),
      }),
    ]);

    if (adminResult.error) {
      console.error("[send-contact] Admin email error:", adminResult.error);
      return NextResponse.json(
        { error: adminResult.error.message ?? "Nie udało się wysłać wiadomości." },
        { status: 500 }
      );
    }

    if (clientResult.error) {
      console.error("[send-contact] Client confirmation error:", clientResult.error);
      return NextResponse.json(
        { error: "Nie udało się wysłać potwierdzenia na adres klienta." },
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
