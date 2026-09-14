/**
 * First-touch attribution, stored in the visitor's own browser.
 *
 * The question this answers is "which channel produced this enquiry" — so the
 * FIRST visit wins and later ones do not overwrite it. Somebody who arrives
 * from a Facebook group, reads an article, leaves, and comes back a week later
 * by typing the address still counts as Facebook, because that is the channel
 * that actually did the work.
 *
 * Nothing here identifies a person: campaign tags, the referring site and the
 * page they landed on. It lives in localStorage, never leaves the browser
 * except attached to an enquiry the visitor chose to send, and expires.
 */

export type Attribution = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  /** gclid / fbclid / msclkid — proves a paid click even without utm tags. */
  clickId?: string;
  referrer?: string;
  landingPath?: string;
  firstSeen: string;
};

const STORAGE_KEY = "baluniak-attribution";
const TTL_DAYS = 30;

function isFresh(entry: Attribution): boolean {
  const seen = Date.parse(entry.firstSeen);
  if (Number.isNaN(seen)) return false;
  return Date.now() - seen < TTL_DAYS * 864e5;
}

export function readAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Attribution;
    if (!parsed?.firstSeen || !isFresh(parsed)) return null;
    return parsed;
  } catch {
    // Private windows and blocked site data both throw here. Attribution is a
    // nice-to-have; never let it break the page.
    return null;
  }
}

/** Records the current visit, unless a fresh first touch already exists. */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;

  try {
    if (readAttribution()) return;

    const params = new URLSearchParams(window.location.search);
    const pick = (name: string) => params.get(name)?.slice(0, 120) || undefined;
    const clickId =
      pick("gclid") ?? pick("fbclid") ?? pick("msclkid") ?? pick("ttclid") ?? undefined;

    const referrer = document.referrer || "";
    // A referrer from our own site means this is not the entry point.
    const external = referrer && !referrer.includes(window.location.host) ? referrer : undefined;

    const entry: Attribution = {
      source: pick("utm_source"),
      medium: pick("utm_medium"),
      campaign: pick("utm_campaign"),
      content: pick("utm_content"),
      term: pick("utm_term"),
      clickId,
      referrer: external?.slice(0, 300),
      landingPath: window.location.pathname.slice(0, 200),
      firstSeen: new Date().toISOString(),
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
  } catch {
    // ignore
  }
}

/**
 * One line naming the channel, for the top of the notification email.
 *
 * Explicit campaign tags win; otherwise the referring domain is translated
 * into something readable, because "l.facebook.com" in an inbox at 7am is not
 * an answer to "where did this come from".
 */
export function describeChannel(a: Attribution | null | undefined, lang: "PL" | "EN" = "PL"): string {
  const direct = lang === "PL" ? "Wejście bezpośrednie" : "Direct visit";
  const unknown = lang === "PL" ? "Nieznane" : "Unknown";
  if (!a) return unknown;

  if (a.source) {
    const parts = [a.source];
    if (a.medium) parts.push(a.medium);
    if (a.campaign) parts.push(a.campaign);
    return parts.join(" · ");
  }

  if (a.clickId) return lang === "PL" ? "Kliknięcie w reklamę" : "Ad click";

  if (a.referrer) {
    let host = a.referrer;
    try {
      host = new URL(a.referrer).hostname.replace(/^www\./, "");
    } catch {
      /* keep the raw value */
    }
    const known: Record<string, string> = {
      "google.com": lang === "PL" ? "Google (organicznie)" : "Google (organic)",
      "google.pl": lang === "PL" ? "Google (organicznie)" : "Google (organic)",
      "bing.com": "Bing",
      "duckduckgo.com": "DuckDuckGo",
      "facebook.com": "Facebook",
      "l.facebook.com": "Facebook",
      "m.facebook.com": "Facebook",
      "instagram.com": "Instagram",
      "linkedin.com": "LinkedIn",
      "lnkd.in": "LinkedIn",
      "x.com": "X",
      "t.co": "X",
      "github.com": "GitHub",
      "useme.com": "Useme",
    };
    return known[host] ?? host;
  }

  return direct;
}
