import Script from "next/script";

/**
 * GA4 tag.
 *
 * The measurement ID is public by design — it ships inside the page HTML on
 * every site that uses Analytics — so it lives here rather than in an env var,
 * where it would only create a way for the tag to silently go missing.
 *
 * `afterInteractive` keeps the tag off the critical path: the page paints
 * first, analytics loads second. That matters because page speed is one of the
 * things we are trying to measure.
 */
const GA_MEASUREMENT_ID = "G-TE55FLKRQT";

export function GoogleAnalytics() {
  // Only load in production — local page views would otherwise pollute the
  // very reports the content pipeline reads back.
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
