"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Projekty", href: "/projekty" },
  { label: "Sklep", href: "/sklep" },
  { label: "Współpraca", href: "/wspolpraca" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 h-16 w-full",
        "border-b border-white/10 bg-black/50 backdrop-blur-md"
      )}
      aria-label="Nawigacja"
    >
      <nav className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold tracking-tighter text-zinc-100 transition-colors hover:text-white"
        >
          <span
            className="size-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)] ring-2 ring-emerald-400/30"
            aria-hidden
          />
          BALUNIAK
        </Link>

        {/* Desktop menu */}
        <div className="hidden items-center gap-1 md:flex">
          {navItems.map(({ label, href }) => (
            <Button key={href} variant="ghost" asChild>
              <Link
                href={href}
                className="text-zinc-300 hover:bg-white/10 hover:text-white"
              >
                {label}
              </Link>
            </Button>
          ))}
        </div>

        {/* Mobile menu trigger + Sheet */}
        <div className="flex md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-zinc-300 hover:bg-white/10 hover:text-white"
                aria-label="Otwórz menu"
              >
                <Menu className="size-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="border-white/10 bg-zinc-950/95 backdrop-blur-xl">
              <SheetHeader>
                <SheetTitle className="text-left text-zinc-100">
                  Menu
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-2">
                <Button variant="ghost" asChild className="justify-start">
                  <Link
                    href="/"
                    onClick={() => setOpen(false)}
                    className="text-zinc-300 hover:bg-white/10 hover:text-white"
                  >
                    Strona główna
                  </Link>
                </Button>
                {navItems.map(({ label, href }) => (
                  <Button key={href} variant="ghost" asChild className="justify-start">
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                      className="text-zinc-300 hover:bg-white/10 hover:text-white"
                    >
                      {label}
                    </Link>
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
