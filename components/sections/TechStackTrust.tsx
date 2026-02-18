"use client";

import { useLanguage } from "@/contexts/LanguageContext";

const LOGOS = [
  {
    name: "Next.js",
    href: "https://nextjs.org",
    svg: (
      <svg viewBox="0 0 180 180" fill="currentColor" className="h-6 w-auto sm:h-7" aria-hidden>
        <mask id="next-a" maskUnits="userSpaceOnUse" x="0" y="0" width="180" height="180">
          <circle cx="90" cy="90" r="90" fill="white" />
        </mask>
        <g mask="url(#next-a)">
          <circle cx="90" cy="90" r="90" fill="black" />
          <path fill="white" d="M90 18v72l-45-52.5v21L90 111l45-52.5v-21L90 90 45 37.5V18l45 45 45-45v19.5L90 81 45 18v19.5L90 72l45-52.5V18H90z" />
        </g>
      </svg>
    ),
  },
  {
    name: "Vercel",
    href: "https://vercel.com",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-auto sm:h-7" aria-hidden>
        <path d="M12 1L2 21h20L12 1zm0 4.5L18.5 19h-13L12 5.5z" />
      </svg>
    ),
  },
  {
    name: "Stripe",
    href: "https://stripe.com",
    svg: (
      <svg viewBox="0 0 60 25" fill="currentColor" className="h-5 w-auto sm:h-6" aria-hidden>
        <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 2.96-1.39 0-.69-.57-1.15-1.66-1.34l-2.33-.49c-2.59-.55-4.01-1.84-4.01-3.88 0-2.52 2.03-4.25 5.26-4.25 3.2 0 5.39 1.76 5.5 4.35h-7.92c-.11-1.46-1.19-2.36-2.81-2.36-1.61 0-2.72.71-2.72 1.58 0 .69.63 1.11 1.79 1.34l2.19.43c2.69.55 4.04 1.77 4.04 3.9 0 2.76-2.14 4.51-5.57 4.51-3.42 0-5.74-1.77-5.93-4.44zM40.95 20.3v-5.83h5.62v-2.15h-5.62V4.02h-2.73V0h9.09v20.3h-6.36zM29.57 4.02h2.73v16.28h-2.73V4.02zM20.37 4.02h2.75v12.26c0 2.52 1.28 4.06 3.54 4.06 1.23 0 2.27-.24 3.02-.68v2.4c-.79.34-1.76.57-2.95.57-3.61 0-5.83-2.31-5.83-6.41V4.02h.02zM9.46 4.02h2.75v12.26c0 2.52 1.28 4.06 3.54 4.06 1.23 0 2.27-.24 3.02-.68v2.4c-.79.34-1.76.57-2.95.57-3.61 0-5.83-2.31-5.83-6.41V4.02zM2.73 0h2.75v20.3H2.73V0z" />
      </svg>
    ),
  },
  {
    name: "OpenAI",
    href: "https://openai.com",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-auto sm:h-7" aria-hidden>
        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0-.3879.6765L3.095 15.023 2.3408 7.8956zm16.5963 3.8558L18.106 9.3644v-3.167a4.504 4.504 0 0 1 2.3655 1.9728l-.5328 6.7722-1.0016-.5774zm2.0107-4.2294l-.142-.0852-4.7735-2.7813a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.7834-2.7582a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0807.0807 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.5328 6.7722-4.7849 2.7702a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997z" />
      </svg>
    ),
  },
  {
    name: "Supabase",
    href: "https://supabase.com",
    svg: (
      <svg viewBox="0 0 109 113" fill="currentColor" className="h-5 w-auto sm:h-6" aria-hidden>
        <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" />
        <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" opacity="0.4" />
        <path d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.04074L54.4841 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.1655 56.4175L45.317 2.07103Z" />
      </svg>
    ),
  },
  {
    name: "Tailwind CSS",
    href: "https://tailwindcss.com",
    svg: (
      <svg viewBox="0 0 54 33" fill="currentColor" className="h-5 w-auto sm:h-6" aria-hidden>
        <path d="M27 0c-6 0-9.5 3-12 6 3 3 6.5 6 13.5 6 5.5 0 9-2.5 11-5-3 3-6.5 6-13.5 6-6 0-9.5-3-12-6 3-3 6.5-6 13.5-6 5.5 0 9 2.5 11 5-3-3-6.5-6-13.5-6-6 0-9.5 3-12 6 3 3 6.5 6 13.5 6 11 0 17.5-6 17.5-11 0-5-2.5-8.5-6.5-11 4-2 6.5-5 6.5-9 0-4-2.5-7-6.5-9.5 4-2 6.5-5 6.5-9 0-2.5-1-5-3-7 2-2 4-3.5 6-4.5-2 .5-4 2-5.5 4-1.5 2-2.5 4.5-2.5 7 0 4 2.5 7 6.5 9.5-4 2-6.5 5-6.5 9 0 4 2.5 7 6.5 9.5-4 2-6.5 5-6.5 9 0 6 6.5 11 17.5 11 7 0 10.5-3 13.5-6-3 3-7.5 6-13.5 6-6 0-9.5-3-12-6 3-3 6.5-6 13.5-6z" />
      </svg>
    ),
  },
] as const;

export function TechStackTrust() {
  const { dict } = useLanguage();
  const heading = dict.hero.techStackTrust;

  return (
    <section
      className="relative z-10 border-y border-white/5 bg-zinc-950/50 py-8 sm:py-10"
      aria-label={heading}
    >
      <div className="mx-auto max-w-5xl px-5 sm:px-6">
        <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-zinc-500 sm:mb-8">
          {heading}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-12 md:gap-x-14">
          {LOGOS.map(({ name, href, svg }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center opacity-50 transition-opacity duration-200 hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-zinc-950"
              aria-label={name}
            >
              <span className="text-zinc-400 [&>svg]:max-h-[28px]">{svg}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
