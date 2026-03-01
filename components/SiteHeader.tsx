"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

const navItems = [
  { label: "Strona główna", href: "/" },
  { label: "Projekty", href: "#projekty" },
  { label: "Kreator", href: "/kreator" },
  { label: "Case Study", href: "/projekty/fotarobota" },
  { label: "Współpraca", href: "/#contact" },
] as const;

export function SiteHeader() {
  const { localeSegment } = useLanguage();
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3"
        aria-label="Menu główne"
      >
        <Link
          href={`/${localeSegment}`}
          className="font-semibold text-zinc-100 transition-colors hover:text-white"
        >
          baluniak
        </Link>
        <ul className="flex items-center gap-6">
          {navItems.map(({ label, href }) => (
            <li key={href}>
              <Link
                href={`/${localeSegment}${href}`}
                className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
