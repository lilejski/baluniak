import { NextResponse } from "next/server";
import { Resend } from "resend";
import { generateEmailHtml, type OrderEmailData } from "@/lib/email-template";

const FROM = "Łukasz Baluniak <lukasz@baluniak.com>";
const ADMIN_EMAIL = "lukasz@baluniak.com";

type SendOrderBody = {
  clientName?: string;
  clientEmail?: string;
  projectType?: string;
  budgetRange?: { min: number; max: number };
  config?: unknown;
  architectSummary?: string;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function confirmationEmailHtml(lang: "PL" | "EN", projectType: string): string {
  const text = lang === "EN"
    ? {
        title: "Inquiry Received",
        body: `Thank you for your inquiry about "${escapeHtml(projectType)}". I've received your project details and will review them. I'll get back to you within 24 hours with next steps.`,
        footer: "Best regards,<br>Łukasz Baluniak"
      }
    : {
        title: "Zapytanie otrzymane",
        body: `Dziękuję za zapytanie dotyczące "${escapeHtml(projectType)}". Otrzymałem szczegóły Twojego projektu i przeanalizuję je. Wrócę z odpowiedzią w ciągu 24h z kolejnymi krokami.`,
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
    const body = (await req.json()) as SendOrderBody;
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("[send-order] Missing RESEND_API_KEY");
      return NextResponse.json(
        { error: "Konfiguracja email nie jest ustawiona." },
        { status: 500 }
      );
    }

    const clientName = body.clientName ?? "Nie podano";
    const clientEmail = (body.clientEmail ?? "").trim();
    const projectType = body.projectType ?? "Kreator";
    const subject = `Nowy Lead: ${projectType} od ${clientName}.`;

    const emailData: OrderEmailData = {
      clientName,
      clientEmail: clientEmail || "Nie podano",
      projectType,
      budgetRange: body.budgetRange,
      selectedFeatures: body.config,
      architectSummary: body.architectSummary,
    };

    const resend = new Resend(apiKey);

    // Detect language from client email domain or default to PL
    const lang: "PL" | "EN" = clientEmail && (clientEmail.includes(".pl") || clientEmail.includes("pl.")) ? "PL" : "EN";

    // Send TWO emails in parallel: admin notification + client confirmation
    const [adminResult, clientResult] = await Promise.all([
      resend.emails.send({
        from: FROM,
        to: ADMIN_EMAIL,
        subject,
        html: generateEmailHtml(emailData),
        replyTo: clientEmail || undefined,
      }),
      clientEmail
        ? resend.emails.send({
            from: FROM,
            to: clientEmail,
            subject: lang === "EN" ? "Confirmation: Inquiry Received" : "Potwierdzenie otrzymania zgłoszenia",
            html: confirmationEmailHtml(lang, projectType),
          })
        : Promise.resolve({ error: null, data: null }),
    ]);

    if (adminResult.error) {
      console.error("[send-order] Admin email error:", adminResult.error);
      return NextResponse.json(
        { error: adminResult.error.message ?? "Nie udało się wysłać wiadomości." },
        { status: 500 }
      );
    }

    if (clientEmail && clientResult.error) {
      console.error("[send-order] Client confirmation error:", clientResult.error);
      return NextResponse.json(
        { error: "Nie udało się wysłać potwierdzenia na adres klienta." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[send-order]", err);
    return NextResponse.json(
      { error: "Nie udało się wysłać zapytania." },
      { status: 500 }
    );
  }
}
