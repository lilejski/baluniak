import type { MetadataRoute } from "next";

const SITE_URL = "https://baluniak.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // API routes have nothing to index and the kreator's endpoints cost
        // money to hit, so keep crawlers out of them entirely.
        disallow: ["/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
