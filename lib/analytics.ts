/**
 * GA4 events.
 *
 * The tag itself loads only in production (components/Analytics.tsx), and ad
 * blockers remove it for some visitors — so every call is a silent no-op when
 * `gtag` is missing, and tracking can never break the page it measures.
 *
 * Parameters carry ids and counts only. Names, emails and phone numbers never
 * go to Analytics: Google's terms forbid it, and the order email already has them.
 */

type EventParams = Record<string, string | number | boolean>;

declare global {
  interface Window {
    gtag?: (command: "event", name: string, params?: EventParams) => void;
  }
}

export function track(name: string, params?: EventParams): void {
  if (typeof window === "undefined") return;
  window.gtag?.("event", name, params);
}
