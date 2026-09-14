/**
 * The two emails a finished order produces: one for the client, one for me.
 *
 * Table-based, inline styles, light palette. Dark-background emails look
 * sharp in a browser and fall apart in Outlook, so this trades the site's
 * night palette for something that renders the same everywhere.
 */

import { describeChannel } from "../attribution";
import type { KreatorAnswer, OrderPayload } from "./types";

const BRAND = "#059669";
const INK = "#18181b";
const MUTED = "#71717a";
const LINE = "#e4e4e7";
const PAPER = "#f4f4f5";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Model output arrives as blank-line separated paragraphs. */
function paragraphs(text: string, color = INK): string {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(
      (p) =>
        `<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:${color};">${esc(p).replace(
          /\n/g,
          "<br>"
        )}</p>`
    )
    .join("");
}

function answerRows(answers: KreatorAnswer[]): string {
  if (!answers.length) return "";
  return answers
    .map((a) => {
      const picked = a.selected.length ? esc(a.selected.join(" · ")) : "—";
      const note = a.note
        ? `<div style="margin-top:6px;padding:10px 12px;background:${PAPER};border-radius:6px;font-size:14px;line-height:1.55;color:${INK};white-space:pre-wrap;">${esc(
            a.note
          )}</div>`
        : "";
      return `
        <tr>
          <td style="padding:14px 0;border-top:1px solid ${LINE};">
            <div style="font-size:12px;color:${MUTED};line-height:1.4;">${esc(a.question)}</div>
            <div style="margin-top:4px;font-size:15px;font-weight:600;color:${INK};">${picked}</div>
            ${note}
          </td>
        </tr>`;
    })
    .join("");
}

function shell(inner: string, preheader: string): string {
  return `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
</head>
<body style="margin:0;padding:0;background:${PAPER};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${PAPER};padding:32px 16px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
      <tr><td style="height:4px;background:${BRAND};"></td></tr>
      <tr><td style="padding:28px 32px 32px;">
        ${inner}
      </td></tr>
    </table>
    <div style="max-width:560px;margin:16px auto 0;font-size:12px;color:${MUTED};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
      baluniak.com
    </div>
  </td></tr>
</table>
</body>
</html>`;
}

const COPY = {
  PL: {
    clientSubject: (s: string) => `Twoje zamówienie: ${s}`,
    preheader: "Mam Twoje zgłoszenie. Odezwę się w ciągu 24 godzin.",
    hello: (name: string) => `Cześć ${name},`,
    intro: "dziękuję za zgłoszenie. Poniżej masz to, co od Ciebie zrozumiałem.",
    summaryTitle: "Twoje zamówienie",
    answersTitle: "Co ustaliliśmy",
    nextTitle: "Co dalej",
    next: "Przeczytam wszystko spokojnie i odezwę się do Ciebie w ciągu 24 godzin z propozycją, jak to zrobić. Jeśli coś w podsumowaniu się nie zgadza, po prostu odpisz na tego maila.",
    signature: "Pozdrawiam,<br><strong>Łukasz Bałuniak</strong>",
    ownerSubject: (s: string, n: string) => `Nowe zamówienie: ${s} — ${n}`,
    ownerTitle: "Nowe zamówienie z Kreatora",
    contactTitle: "Kontakt",
    serviceTitle: "Wybrana ścieżka",
    aiTitle: "Podsumowanie",
    labelName: "Imię / firma",
    labelEmail: "Email",
    labelPhone: "Telefon",
    labelCompany: "Firma",
    sentAt: "Wysłano",
    channelTitle: "Skąd przyszedł",
    channelFirstSeen: "Pierwsza wizyta",
    channelLanding: "Wszedł na",
    channelNoData:
      "Brak danych — przeglądarka blokowała zapis albo wizyta zaczęła się przed wdrożeniem pomiaru.",
  },
  EN: {
    clientSubject: (s: string) => `Your request: ${s}`,
    preheader: "I have your request. I'll be in touch within 24 hours.",
    hello: (name: string) => `Hi ${name},`,
    intro: "thanks for getting in touch. Here's what I understood from you.",
    summaryTitle: "Your request",
    answersTitle: "What we covered",
    nextTitle: "What happens next",
    next: "I'll read through it properly and come back to you within 24 hours with how I'd approach it. If anything in the summary is off, just reply to this email.",
    signature: "Best regards,<br><strong>Łukasz Bałuniak</strong>",
    ownerSubject: (s: string, n: string) => `New order: ${s} — ${n}`,
    ownerTitle: "New order from the Kreator",
    contactTitle: "Contact",
    serviceTitle: "Chosen path",
    aiTitle: "Summary",
    labelName: "Name / company",
    labelEmail: "Email",
    labelPhone: "Phone",
    labelCompany: "Company",
    sentAt: "Sent",
    channelTitle: "Came from",
    channelFirstSeen: "First visit",
    channelLanding: "Landed on",
    channelNoData: "No data — storage was blocked, or the visit predates the tracking.",
  },
} as const;

/** The line that answers "which channel produced this" at a glance. */
function channelBlock(order: OrderPayload): string {
  const t = COPY[order.lang];
  const a = order.attribution;

  if (!a) {
    return `<p style="margin:0;font-size:13px;color:${MUTED};">${esc(t.channelNoData)}</p>`;
  }

  const details: string[] = [];
  const firstSeen = new Date(a.firstSeen);
  if (!Number.isNaN(firstSeen.getTime())) {
    const when = firstSeen.toLocaleString(order.lang === "PL" ? "pl-PL" : "en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    details.push(`${esc(t.channelFirstSeen)}: ${esc(when)}`);
  }
  if (a.landingPath) details.push(`${esc(t.channelLanding)}: ${esc(a.landingPath)}`);
  if (a.referrer) details.push(esc(a.referrer));

  const detailHtml = details.length
    ? `<div style="margin-top:6px;font-size:12px;line-height:1.7;color:${MUTED};">${details.join("<br>")}</div>`
    : "";

  return `<div style="font-size:17px;font-weight:700;color:${BRAND};">${esc(
    describeChannel(a, order.lang)
  )}</div>${detailHtml}`;
}

const h2 = (text: string) =>
  `<div style="margin:28px 0 8px;font-size:11px;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:${MUTED};">${esc(
    text
  )}</div>`;

/** The confirmation the client receives. */
export function clientEmailHtml(order: OrderPayload): string {
  const t = COPY[order.lang];
  const firstName = order.contact.name.split(/\s+/)[0] || order.contact.name;

  const summaryBlock = order.summary
    ? `<div style="margin-top:10px;padding:18px 20px;background:${PAPER};border-radius:10px;border-left:3px solid ${BRAND};">${paragraphs(
        order.summary
      )}</div>`
    : "";

  return shell(
    `
    <p style="margin:0 0 6px;font-size:16px;color:${INK};">${esc(t.hello(firstName))}</p>
    <p style="margin:0 0 4px;font-size:15px;line-height:1.65;color:${INK};">${esc(t.intro)}</p>

    ${h2(t.summaryTitle)}
    <div style="font-size:15px;font-weight:600;color:${BRAND};">${esc(order.serviceLabel)}</div>
    ${summaryBlock}

    ${h2(t.answersTitle)}
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      ${answerRows(order.answers)}
    </table>

    ${h2(t.nextTitle)}
    <p style="margin:0 0 20px;font-size:15px;line-height:1.65;color:${INK};">${esc(t.next)}</p>

    <div style="padding-top:20px;border-top:1px solid ${LINE};font-size:14px;line-height:1.6;color:${INK};">${t.signature}</div>
  `,
    t.preheader
  );
}

/** The notification that lands in my inbox. */
export function ownerEmailHtml(order: OrderPayload): string {
  const t = COPY[order.lang];
  const c = order.contact;

  const row = (label: string, value: string, isLink?: "mail" | "tel") => {
    const shown = isLink === "mail"
      ? `<a href="mailto:${esc(value)}" style="color:${BRAND};text-decoration:none;">${esc(value)}</a>`
      : isLink === "tel"
        ? `<a href="tel:${esc(value.replace(/\s/g, ""))}" style="color:${BRAND};text-decoration:none;">${esc(value)}</a>`
        : esc(value);
    return `<tr>
      <td style="padding:6px 12px 6px 0;font-size:12px;color:${MUTED};white-space:nowrap;vertical-align:top;">${esc(label)}</td>
      <td style="padding:6px 0;font-size:15px;color:${INK};font-weight:600;">${shown}</td>
    </tr>`;
  };

  const summaryBlock = order.summary
    ? `<div style="margin-top:8px;padding:16px 18px;background:${PAPER};border-radius:10px;">${paragraphs(
        order.summary
      )}</div>`
    : "";

  const sentAt = new Date().toLocaleString(order.lang === "PL" ? "pl-PL" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return shell(
    `
    <div style="font-size:19px;font-weight:700;color:${INK};">${esc(t.ownerTitle)}</div>

    ${h2(t.contactTitle)}
    <table cellpadding="0" cellspacing="0" role="presentation">
      ${row(t.labelName, c.name)}
      ${row(t.labelEmail, c.email, "mail")}
      ${c.phone ? row(t.labelPhone, c.phone, "tel") : ""}
      ${c.company ? row(t.labelCompany, c.company) : ""}
    </table>

    ${h2(t.serviceTitle)}
    <div style="font-size:16px;font-weight:600;color:${BRAND};">${esc(order.serviceLabel)}</div>

    ${h2(t.channelTitle)}
    ${channelBlock(order)}

    ${order.summary ? h2(t.aiTitle) + summaryBlock : ""}

    ${h2(t.answersTitle)}
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      ${answerRows(order.answers)}
    </table>

    <div style="margin-top:24px;padding-top:16px;border-top:1px solid ${LINE};font-size:12px;color:${MUTED};">
      ${esc(t.sentAt)}: ${esc(sentAt)} · ${esc(order.lang)}
    </div>
  `,
    `${order.serviceLabel} — ${c.name}`
  );
}

export function subjects(order: OrderPayload) {
  const t = COPY[order.lang];
  return {
    client: t.clientSubject(order.serviceLabel),
    owner: t.ownerSubject(order.serviceLabel, order.contact.name),
  };
}
