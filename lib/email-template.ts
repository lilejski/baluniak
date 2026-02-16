/**
 * HTML email template for order/inquiry notifications (Resend).
 */

export type OrderEmailData = {
  clientName: string;
  clientEmail: string;
  projectType?: string;
  budgetRange?: { min: number; max: number };
  selectedFeatures?: unknown;
  architectSummary?: string;
};

const section = (title: string, html: string) => `
  <tr><td style="padding:12px 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#71717a;">${title}</td></tr>
  <tr><td style="padding:4px 0 16px;font-size:14px;line-height:1.5;color:#e4e4e7;">${html}</td></tr>
`;

const escape = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Generates a clean receipt/summary HTML email for a new project inquiry. */
export function generateEmailHtml(data: OrderEmailData): string {
  const name = escape(data.clientName || "—");
  const email = escape(data.clientEmail || "—");
  const projectType = escape(data.projectType || "Nie podano");
  const budget =
    data.budgetRange != null
      ? `${data.budgetRange.min} – ${data.budgetRange.max} PLN`
      : "—";
  const featuresHtml =
    data.selectedFeatures != null
      ? `<pre style="margin:0;font-size:12px;background:#27272a;padding:12px;border-radius:8px;overflow:auto;color:#d4d4d8;">${escape(JSON.stringify(data.selectedFeatures, null, 2))}</pre>`
      : "<p>—</p>";
  const summaryHtml = data.architectSummary
    ? `<div style="white-space:pre-wrap;font-size:13px;">${escape(data.architectSummary)}</div>`
    : "<p>—</p>";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;font-family:system-ui,-apple-system,sans-serif;background:#18181b;color:#e4e4e7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;padding:24px;">
    <tr><td style="padding:0 0 24px;font-size:18px;font-weight:700;color:#10b981;">Nowe Zapytanie o Projekt</td></tr>
    ${section("Dane klienta", `<p style="margin:0;"><strong>Imię / firma:</strong> ${name}<br><strong>Email:</strong> ${email}</p>`)}
    ${section("Typ projektu", `<p style="margin:0;">${projectType}</p>`)}
    ${section("Budżet (PLN)", `<p style="margin:0;">${budget}</p>`)}
    ${section("Wybrane opcje / konfiguracja", featuresHtml)}
    ${section("Podsumowanie architekta (AI)", summaryHtml)}
    <tr><td style="padding:24px 0 0;font-size:12px;color:#71717a;">Wysłano z formularza Kreatora · baluniak.com</td></tr>
  </table>
</body>
</html>
  `.trim();
}
