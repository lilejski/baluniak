# baluniak.com

Portfolio and client site of **Łukasz Bałuniak** — full-stack developer working with Next.js, TypeScript and AI integrations.

**Live:** [baluniak.com](https://baluniak.com) · **For recruiters:** [baluniak.com/en/o-mnie](https://baluniak.com/en/o-mnie)

## What it is

One site, two audiences, two doors:

- **The home page** speaks to small businesses in plain language — websites, business software, automation — and leads to an AI-assisted order builder.
- **`/o-mnie`** speaks to recruiters and engineering teams — stack, the architecture decisions behind each project, and a CV that prints straight from the page.

Plus case studies of three production projects (Fotarobota, Quantum OM, Charon) and a bilingual blog. Everything exists in Polish and English.

## Architecture highlights

**AI order builder** — [`app/api/kreator/next/route.ts`](app/api/kreator/next/route.ts)
Claude drafts the follow-up questions through structured output validated by a Zod schema. If the model fails or times out, a scripted question flow takes over, so the visitor never sees an error. Requests are rate-limited per client ([`lib/kreator/rate-limit.ts`](lib/kreator/rate-limit.ts)), and the summary email sent through Resend carries first-touch UTM attribution ([`lib/attribution.ts`](lib/attribution.ts)).

**A blog that drafts itself, gated by a human** — [`lib/seo/`](lib/seo)
A weekly Vercel Cron ([`vercel.json`](vercel.json)) calls [`app/api/seo/draft/route.ts`](app/api/seo/draft/route.ts):

1. [`opportunities.ts`](lib/seo/opportunities.ts) reads Search Console and GA4 and ranks queries the site already half-ranks for. Below 25 queries it refuses to guess and the curated backlog in [`content/topics.ts`](content/topics.ts) is used instead.
2. [`draft.ts`](lib/seo/draft.ts) has Claude write the article in both languages, with internal links and a strict plain-language brief.
3. [`github.ts`](lib/seo/github.ts) commits both files to a new branch and opens a pull request. Drafts land with `draft: true` — noindex, out of listings and the sitemap — until a human publishes them. Topics that already have a pull request are skipped.

**Google APIs without `googleapis`** — [`lib/seo/google-auth.ts`](lib/seo/google-auth.ts)
The service-account JWT is signed with `node:crypto` (RS256) and exchanged for an access token, instead of pulling in a very large client library for one signature.

**Internationalisation**
Routes live under a `[lang]` segment. [`proxy.ts`](proxy.ts) picks the language from an explicit cookie, then the Vercel geolocation header, then `Accept-Language`. All copy comes from a single typed dictionary, [`lib/translations.ts`](lib/translations.ts). Blog posts are paired across languages by `translationKey`, and the language switcher follows each page's `hreflang` alternates, so translated slugs never 404.

**Search engines**
Sitemap with language alternates ([`app/sitemap.ts`](app/sitemap.ts)) and JSON-LD — `Person`, `ProfilePage`, `SoftwareApplication`, `BlogPosting` — all pointing at one `Person` `@id` ([`lib/structured-data.ts`](lib/structured-data.ts)).

**Printable CV**
[`app/[lang]/o-mnie/page.tsx`](app/%5Blang%5D/o-mnie/page.tsx) is a server component with no entrance animations, so it reads without JavaScript. Print styles in [`app/globals.css`](app/globals.css) turn the dark UI into paper and hide the site chrome.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui (Radix) · Framer Motion · three.js / React Three Fiber · Vercel AI SDK with Anthropic Claude · Zod · React Hook Form · Resend · Vercel (hosting, Cron, Analytics)

## Structure

```
app/
  [lang]/            pages: home, o-mnie, kreator, blog, projekty/*, sklep
  api/
    kreator/         order builder: next question, submit
    seo/             report and weekly draft (Bearer-protected)
    send-contact/    contact form
components/          sections, UI primitives, 3D hero
content/
  blog/{pl,en}/      Markdown articles
  topics.ts          backlog for the content pipeline
lib/
  seo/               Search Console, GA4, Google auth, drafting, GitHub
  kreator/           order builder content, rate limiting, email
  blog/              Markdown loading
  translations.ts    all copy, PL + EN
proxy.ts             locale redirect
```

## Running locally

```bash
npm install
npm run dev
```

The site renders without any environment variables; each integration switches on when its variables are present. Put them in `.env` (the standalone report script below reads that file directly):

| Variable | Used by |
| --- | --- |
| `ANTHROPIC_API_KEY` | Order builder questions, article drafts |
| `RESEND_API_KEY` | Order builder and contact form emails |
| `GOOGLE_SERVICE_ACCOUNT_B64` | Search Console and GA4 (base64-encoded service-account JSON) |
| `GA4_PROPERTY_ID` | GA4 part of the SEO report |
| `SEO_REPORT_SECRET` | Bearer token for `/api/seo/report` and `/api/seo/draft` |
| `GITHUB_TOKEN` | Opening draft pull requests (fine-grained: contents and pull requests) |

Without `ANTHROPIC_API_KEY` the order builder falls back to its scripted questions.

To print the Search Console and GA4 report for the last 28 days, without running the dev server (default: 90 days):

```bash
node scripts/seo-report.mjs 28
```

## License

The source is published for portfolio review. No license is granted — all rights reserved.
