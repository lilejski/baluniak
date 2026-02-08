"use client";

import Link from "next/link";

const navItems = [
  { label: "Strona główna", href: "/" },
  { label: "Projekty", href: "/projekty" },
  { label: "Kreator", href: "/kreator" },
  { label: "Sklep", href: "/sklep" },
  { label: "Współpraca", href: "/wspolpraca" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3"
        aria-label="Menu główne"
      >
        <Link
          href="/"
          className="font-semibold text-zinc-100 transition-colors hover:text-white"
        >
          baluniak
        </Link>
        <ul className="flex items-center gap-6">
          {navItems.map(({ label, href }) => (
            <li key={href}>
              <Link
                href={href}
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
