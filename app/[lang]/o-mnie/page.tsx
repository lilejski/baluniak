import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Award, Github, Linkedin } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { TechLine } from "@/components/ui/tech-line";
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

const h2 = "text-h2 mb-5";
const card = "cv-card card p-5 md:p-6";
const ghostButton = buttonVariants({ variant: "secondary", size: "sm" });
const primaryButton = buttonVariants({ size: "sm" });

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
    <article className="cv container-narrow page-top text-fg">
      <JsonLd data={profilePageJsonLd(segment)} />

      <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-full border border-border-strong sm:size-32 print:size-20">
          <Image src="/li.jpg" alt={page.name} fill sizes="8rem" className="object-cover" priority />
        </div>
        <div className="min-w-0 flex-1">
          <p className="eyebrow print:hidden">
            {page.eyebrow}
          </p>
          <h1 className="text-h1 mt-2">{page.name}</h1>
          <p className="text-lead mt-2 text-fg">{page.role}</p>
          <p className="mt-4 max-w-[65ch] text-base leading-relaxed text-fg-muted">{page.summary}</p>
          <p className="mt-4 inline-block rounded-md border border-border-strong bg-surface-2 px-3 py-1.5 text-sm text-fg">
            <span className="font-semibold">{page.availabilityLabel}:</span> {page.availability}
          </p>

          {/* On paper the buttons are useless; the addresses themselves are what counts. */}
          <p className="mt-3 hidden text-sm print:block">
            {footer.email} · {linkedinLabel} · {githubLabel} · baluniak.com/{segment}/o-mnie
          </p>

          <div className="mt-6 flex flex-wrap gap-3 print:hidden">
            <a href={`mailto:${footer.email}`} className={primaryButton}>
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
            <p className="font-display text-2xl font-semibold tabular-nums text-fg">{fact.value}</p>
            <p className="mt-1 text-sm leading-snug text-fg-subtle">{fact.label}</p>
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
              <h3 className="text-h4 mb-2">{group.group}</h3>
              <TechLine items={group.items} className="text-[0.9375rem]" />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14" aria-labelledby="projects-heading">
        <h2 id="projects-heading" className={h2}>
          {page.projectsTitle}
        </h2>
        <p className="-mt-2 mb-6 max-w-[65ch] text-base text-fg-muted">{page.projectsLead}</p>
        <div className="space-y-4">
          {page.projects.map((project) => {
            const caseStudy = CASE_STUDY_PATHS[project.id];
            const source = SOURCE_URLS[project.id];
            return (
              <article key={project.id} className={card}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="text-h3">{project.name}</h3>
                  <p className="text-sm text-fg-subtle">
                    {page.statusLabel}: {project.status}
                  </p>
                </div>
                <p className="mt-1 text-base text-fg">{project.tagline}</p>
                <ul className="mt-4 space-y-2 text-base leading-relaxed text-fg-muted">
                  {project.decisions.map((decision) => (
                    <li key={decision} className="flex gap-3">
                      <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" />
                      <span>{decision}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm text-fg-subtle">
                  <span className="text-fg-muted">{page.stackLabel}:</span> {project.stack}
                </p>
                {(caseStudy || source) && (
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm print:hidden">
                    {caseStudy && (
                      <Link
                        href={`/${segment}${caseStudy}`}
                        className="inline-flex min-h-11 items-center gap-1 font-medium text-accent hover:text-accent-hover"
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
                        className="inline-flex min-h-11 items-center gap-1 font-medium text-accent hover:text-accent-hover"
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
              <h3 className="text-h4">{principle.title}</h3>
              <p className="mt-1.5 text-base leading-relaxed text-fg-muted">{principle.desc}</p>
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
          className={`${card} card-interactive flex items-center gap-4`}
        >
          <Award className="size-6 shrink-0 text-accent" strokeWidth={1.5} aria-hidden />
          <span className="min-w-0">
            <span className="block font-medium text-fg">{page.certName}</span>
            <span className="mt-0.5 inline-flex items-center gap-1 text-sm text-accent underline underline-offset-3 print:hidden">
              {page.certCta}
              <ArrowUpRight className="size-3.5" aria-hidden />
            </span>
          </span>
        </a>
      </section>

      <section
        className="card mt-14 p-5 md:p-8 print:hidden"
        aria-labelledby="contact-heading"
      >
        <h2 id="contact-heading" className="text-h2">
          {page.contactTitle}
        </h2>
        <p className="mt-3 text-base text-fg-muted">{page.contactLead}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a href={`mailto:${footer.email}`} className={primaryButton}>
            {footer.email}
          </a>
          <PrintButton label={page.printCta} className={ghostButton} />
        </div>
        <p className="mt-6 text-sm text-fg-subtle">
          <Link href={`/${segment}`} className="inline-flex min-h-11 items-center gap-1 hover:text-fg">
            {page.clientsLink}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </p>
      </section>
    </article>
  );
}
