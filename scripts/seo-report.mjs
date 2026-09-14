/**
 * Prints the SEO report in a terminal, reading .env directly.
 *
 * Deliberately standalone: no dev server, no secret header, no deploy needed.
 * Run it whenever you want to know what Google currently thinks of the site.
 *
 *   node scripts/seo-report.mjs [dni]
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const DAYS = Number(process.argv[2] ?? 90);
const SITE = "sc-domain:baluniak.com";

// --- env -------------------------------------------------------------------
const envPath = path.join(ROOT, ".env");
if (!fs.existsSync(envPath)) {
  console.error("Brak .env w", ROOT);
  process.exit(1);
}
const envText = fs.readFileSync(envPath, "utf8");
const envValue = (name) => envText.match(new RegExp(`^${name}=(.*)$`, "m"))?.[1]?.trim();

const b64 = envValue("GOOGLE_SERVICE_ACCOUNT_B64");
if (!b64) {
  console.error("Brak GOOGLE_SERVICE_ACCOUNT_B64 w .env");
  process.exit(1);
}
const account = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
const ga4Property = envValue("GA4_PROPERTY_ID");

// --- auth ------------------------------------------------------------------
const b64u = (v) =>
  Buffer.from(v).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

async function tokenFor(scope) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64u(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64u(
    JSON.stringify({ iss: account.client_email, scope, aud: account.token_uri, exp: now + 3600, iat: now })
  );
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const assertion = `${header}.${claims}.${b64u(signer.sign(account.private_key))}`;
  const res = await fetch(account.token_uri, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!res.ok) throw new Error(`token ${res.status}`);
  return (await res.json()).access_token;
}

// --- gsc -------------------------------------------------------------------
const iso = (d) => d.toISOString().slice(0, 10);
const end = new Date(Date.now() - 3 * 864e5);
const start = new Date(end.getTime() - DAYS * 864e5);

const gscToken = await tokenFor("https://www.googleapis.com/auth/webmasters.readonly");

async function gsc(dimensions, rowLimit = 250) {
  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: { authorization: `Bearer ${gscToken}`, "content-type": "application/json" },
      body: JSON.stringify({ startDate: iso(start), endDate: iso(end), dimensions, rowLimit }),
    }
  );
  if (!res.ok) {
    console.error("GSC", res.status, (await res.text()).slice(0, 160));
    return [];
  }
  return (await res.json()).rows ?? [];
}

const pad = (v, n) => String(v).padStart(n);
const pct = (v) => `${(v * 100).toFixed(1)}%`;

console.log(`\n═══ RAPORT SEO · ${iso(start)} → ${iso(end)} (${DAYS} dni) ═══\n`);

const [totals] = await gsc([], 1);
if (totals) {
  console.log(
    `Kliknięcia ${totals.clicks}   Wyświetlenia ${totals.impressions}   CTR ${pct(totals.ctr)}   Śr. pozycja ${totals.position.toFixed(1)}\n`
  );
} else {
  console.log("Brak danych w tym oknie.\n");
}

const queries = await gsc(["query"]);
const MIN_QUERIES = 25;
const MIN_IMPRESSIONS = 3;

console.log(`Zapytań z danymi: ${queries.length}`);
if (queries.length < MIN_QUERIES) {
  console.log(
    `⚠️  Za mało, żeby typować tematy z danych (próg: ${MIN_QUERIES}).\n   Na tym etapie tematy wybiera człowiek, nie automat.\n`
  );
}

// --- opportunities ---------------------------------------------------------
const pairs = await gsc(["query", "page"], 500);
const pageFor = new Map();
for (const row of pairs) if (!pageFor.has(row.keys[0])) pageFor.set(row.keys[0], row.keys[1]);

const opportunities = [];
for (const row of queries) {
  if (row.impressions < MIN_IMPRESSIONS) continue;
  let kind = null;
  if (row.position <= 10 && row.ctr < 0.02) kind = "słaby CTR";
  else if (row.position > 4 && row.position <= 20) kind = "blisko szczytu";
  else if (row.position > 20 && row.impressions >= 10) kind = "własna strona";
  if (!kind) continue;
  const climb = Math.max(1, row.position - 3);
  opportunities.push({
    query: row.keys[0],
    kind,
    impressions: row.impressions,
    position: row.position,
    ctr: row.ctr,
    page: pageFor.get(row.keys[0]) ?? "—",
    score: row.impressions / Math.sqrt(climb),
  });
}
opportunities.sort((a, b) => b.score - a.score);

console.log(`\n── SZANSE (${opportunities.length}) ──`);
if (!opportunities.length) {
  console.log("Brak. Żadne zapytanie nie ma jeszcze dość wyświetleń, żeby coś z niego wyciągnąć.");
} else {
  for (const o of opportunities.slice(0, 20)) {
    console.log(
      `${pad(o.impressions, 5)} wyśw  poz ${pad(o.position.toFixed(1), 5)}  CTR ${pad(pct(o.ctr), 6)}  [${o.kind}]  ${o.query}`
    );
  }
}

const pages = await gsc(["page"], 25);
console.log(`\n── STRONY (${pages.length}) ──`);
for (const row of pages) {
  console.log(
    `${pad(row.clicks, 4)} klik ${pad(row.impressions, 5)} wyśw  poz ${pad(row.position.toFixed(1), 5)}  ${row.keys[0].replace(/^https?:\/\/[^/]+/, "")}`
  );
}

// --- ga4 -------------------------------------------------------------------
console.log(`\n── GA4 ──`);
if (!ga4Property) {
  console.log("GA4_PROPERTY_ID nieustawione — pomijam. (Administracja → Szczegóły usługi)");
} else {
  const gaToken = await tokenFor("https://www.googleapis.com/auth/analytics.readonly");
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${ga4Property}:runReport`,
    {
      method: "POST",
      headers: { authorization: `Bearer ${gaToken}`, "content-type": "application/json" },
      body: JSON.stringify({
        dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "sessions" }, { name: "userEngagementDuration" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 20,
      }),
    }
  );
  if (!res.ok) {
    console.log("Błąd GA4:", res.status, (await res.text()).slice(0, 180));
  } else {
    const rows = (await res.json()).rows ?? [];
    if (!rows.length) console.log("Brak sesji w ostatnich 28 dniach.");
    for (const row of rows) {
      const sessions = Number(row.metricValues[0].value);
      const seconds = sessions ? Math.round(Number(row.metricValues[1].value) / sessions) : 0;
      console.log(`${pad(sessions, 5)} sesji  ${pad(seconds, 4)}s śr.  ${row.dimensionValues[0].value}`);
    }
  }
}

console.log("");
