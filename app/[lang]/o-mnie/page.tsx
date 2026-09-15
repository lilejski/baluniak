import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Award, Github, Linkedin, Mail } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { PrintButton } from "@/components/PrintButton";
import { profilePageJsonLd } from "@/lib/structured-data";
import { translations } from "@/lib/translations";

const SITE_URL = "https://baluniak.com";

/** Case-study routes; the site itself has none. */
const CASE_STUDY_PATHS: Partial<Record<string, string>> = {
  fotarobota: "/projekty/fotarobota",
  "quantum-om": "/projekty/quantum-om",
  charon: "/projekty/charon",
};

/** Source code, only where it is public. */
const SOURCE_URLS: Partial<Record<string, string>> = {
  baluniak: "https://github.com/lilejski/baluniak",
};

type Props = { params: Promise<{ lang: string }> };

function copyFor(lang: string) {
  const dict = translations[lang === "en" ? "EN" : "PL"];
  return { page: dict.aboutPage, footer: dict.footer };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const { page } = copyFor(lang);
  const canonical = `${SITE_URL}/${lang}/o-mnie`;
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: {
      canonical,
      languages: { pl: `${SITE_URL}/pl/o-mnie`, en: `${SITE_URL}/en/o-mnie` },
    },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      url: canonical,
      siteName: "BALUNIAK.COM",
      locale: lang === "en" ? "en_US" : "pl_PL",
      type: "profile",
      images: [`${SITE_URL}/og-baluniak.png`],
    },
    robots: { index: true, follow: true },
  };
}

const h2 = "mb-5 text-2xl font-semibold tracking-tight text-zinc-100";
const card = "cv-card rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 sm:p-6";
const ghostButton =
  "inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-200 transition-colors hover:border-white/20 hover:bg-white/10";
const primaryButton =
  "inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-emerald-50 transition-colors hover:bg-emerald-500";

/**
 * The recruiter door. Rendered on the server with no entrance animations, so
 * the whole page is readable without JavaScript and prints as a CV.
 */
export default async function AboutMePage({ params }: Props) {
  const { lang } = await params;
  const segment = lang === "en" ? "en" : "pl";
  const { page, footer } = copyFor(lang);
  const linkedinLabel = decodeURI(footer.linkedinUrl).replace(/^https:\/\/www\./, "").replace(/\/$/, "");
  const githubLabel = footer.githubUrl.replace(/^https:\/\//, "");

  return (
    <article className="cv mx-auto max-w-4xl px-5 py-10 text-zinc-100 sm:px-6 sm:py-14">
      <JsonLd data={profilePageJsonLd(segment)} />

      <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-full border-2 border-emerald-500 sm:size-32 print:size-20">
          <Image src="/li.jpg" alt={page.name} fill sizes="8rem" className="object-cover" priority />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-emerald-400 print:hidden">
            {page.eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{page.name}</h1>
          <p className="mt-1 text-lg text-emerald-300">{page.role}</p>
          <p className="mt-4 max-w-[65ch] leading-relaxed text-zinc-300">{page.summary}</p>
          <p className="mt-4 inline-block rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-3 py-1.5 text-sm text-emerald-100">
            <span className="font-semibold">{page.availabilityLabel}:</span> {page.availability}
          </p>

          {/* On paper the buttons are useless; the addresses themselves are what counts. */}
          <p className="mt-3 hidden text-sm print:block">
            {footer.email} · {linkedinLabel} · {githubLabel} · baluniak.com/{segment}/o-mnie
          </p>

          <div className="mt-6 flex flex-wrap gap-3 print:hidden">
            <a href={`mailto:${footer.email}`} className={primaryButton}>
              <Mail className="size-4" aria-hidden />
              {page.contactCta}
            </a>
            <a href={footer.linkedinUrl} target="_blank" rel="noopener noreferrer" className={ghostButton}>
              <Linkedin className="size-4" aria-hidden />
              LinkedIn
            </a>
            <a href={footer.githubUrl} target="_blank" rel="noopener noreferrer" className={ghostButton}>
              <Github className="size-4" aria-hidden />
              GitHub
            </a>
            <PrintButton label={page.printCta} className={ghostButton} />
          </div>
        </div>
      </header>

      <section aria-label={page.factsLabel} className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {page.facts.map((fact) => (
          <div key={fact.label} className={card}>
            <p className="text-2xl font-bold text-emerald-400">{fact.value}</p>
            <p className="mt-1 text-sm leading-snug text-zinc-400">{fact.label}</p>
          </div>
        ))}
      </section>

      <section className="mt-14" aria-labelledby="skills-heading">
        <h2 id="skills-heading" className={h2}>
          {page.skillsTitle}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {page.skills.map((group) => (
            <div key={group.group} className={card}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">{group.group}</h3>
              <ul className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-zinc-300"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14" aria-labelledby="projects-heading">
        <h2 id="projects-heading" className={h2}>
          {page.projectsTitle}
        </h2>
        <p className="-mt-2 mb-6 max-w-[65ch] text-sm text-zinc-400">{page.projectsLead}</p>
        <div className="space-y-4">
          {page.projects.map((project) => {
            const caseStudy = CASE_STUDY_PATHS[project.id];
            const source = SOURCE_URLS[project.id];
            return (
              <article key={project.id} className={card}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="text-xl font-semibold text-zinc-100">{project.name}</h3>
                  <p className="font-mono text-xs uppercase tracking-wider text-zinc-500">
                    {page.statusLabel}: {project.status}
                  </p>
                </div>
                <p className="mt-1 text-zinc-300">{project.tagline}</p>
                <ul className="mt-4 space-y-2 text-sm leading-relaxed text-zinc-400">
                  {project.decisions.map((decision) => (
                    <li key={decision} className="flex gap-3">
                      <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-500" />
                      <span>{decision}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 font-mono text-xs text-zinc-500">
                  <span className="text-zinc-400">{page.stackLabel}:</span> {project.stack}
                </p>
                {(caseStudy || source) && (
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm print:hidden">
                    {caseStudy && (
                      <Link
                        href={`/${segment}${caseStudy}`}
                        className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300"
                      >
                        {page.caseStudyCta}
                        <ArrowRight className="size-4" aria-hidden />
                      </Link>
                    )}
                    {source && (
                      <a
                        href={source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300"
                      >
                        {page.sourceCta}
                        <ArrowUpRight className="size-4" aria-hidden />
                      </a>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-14" aria-labelledby="principles-heading">
        <h2 id="principles-heading" className={h2}>
          {page.principlesTitle}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {page.principles.map((principle) => (
            <div key={principle.title} className={card}>
              <h3 className="font-semibold text-zinc-100">{principle.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{principle.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14" aria-labelledby="cert-heading">
        <h2 id="cert-heading" className={h2}>
          {page.certTitle}
        </h2>
        <a
          href={page.certUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${card} flex items-center gap-4 transition-colors hover:border-zinc-700`}
        >
          <Award className="size-8 shrink-0 text-[#4285F4]" aria-hidden />
          <span className="min-w-0">
            <span className="block font-medium text-zinc-100">{page.certName}</span>
            <span className="mt-0.5 inline-flex items-center gap-1 text-sm text-[#76a9fc] print:hidden">
              {page.certCta}
              <ArrowUpRight className="size-3.5" aria-hidden />
            </span>
          </span>
        </a>
      </section>

      <section
        className="mt-14 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6 sm:p-8 print:hidden"
        aria-labelledby="contact-heading"
      >
        <h2 id="contact-heading" className="text-2xl font-semibold tracking-tight text-zinc-100">
          {page.contactTitle}
        </h2>
        <p className="mt-2 text-zinc-300">{page.contactLead}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a href={`mailto:${footer.email}`} className={primaryButton}>
            <Mail className="size-4" aria-hidden />
            {footer.email}
          </a>
          <PrintButton label={page.printCta} className={ghostButton} />
        </div>
        <p className="mt-6 text-sm text-zinc-400">
          <Link href={`/${segment}`} className="inline-flex items-center gap-1 hover:text-zinc-200">
            {page.clientsLink}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </p>
      </section>
    </article>
  );
}
