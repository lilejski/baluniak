"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { GrainTexture } from "@/components/GrainTexture";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Projekty", href: "/projekty" },
  { label: "O mnie", href: "/#about" },
  { label: "Sklep", href: "/sklep" },
] as const;

const mobileMenuListVariants = {
  closed: { opacity: 0, y: 8 },
  open: {
    opacity: 1,
    y: 0,
    transition: { delayChildren: 0.08, staggerChildren: 0.05 },
  },
} as const;

const mobileMenuItemVariants = {
  closed: { opacity: 0, y: 6 },
  open: { opacity: 1, y: 0 },
} as const;

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 h-16 w-full",
        "border-b border-white/10 bg-black/50 backdrop-blur-md"
      )}
      aria-label="Nawigacja"
    >
      <nav className="mx-auto flex h-full max-w-6xl items-center justify-between px-5 sm:px-6">
        {/* Logo: clean, bold → BALUNIAK.COM */}
        <Link
          href="/"
          className="font-bold tracking-tight text-zinc-100 transition-colors hover:text-white"
        >
          BALUNIAK.COM
        </Link>

        {/* Desktop: nav links + main CTA */}
        <div className="hidden items-center gap-2 md:flex">
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
          <Button asChild size="default" className="ml-2">
            <Link
              href="/kreator"
              className="bg-emerald-600 font-semibold text-white shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:bg-emerald-500"
            >
              <motion.span
                className="inline-block"
                animate={{ opacity: [1, 0.85, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                Zbuduj MVP (80h)
              </motion.span>
            </Link>
          </Button>
        </div>

        {/* Mobile: burger + sheet */}
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
            <SheetContent
              side="right"
              className="border-white/10 bg-zinc-950/95 backdrop-blur-xl"
            >
              <div className="relative flex h-full flex-col">
                <GrainTexture opacity={0.09} position="absolute" className="z-0" />
                <div className="relative z-10 flex flex-1 flex-col">
                  <SheetHeader>
                    <SheetTitle className="text-left text-zinc-100">
                      Menu
                    </SheetTitle>
                  </SheetHeader>
                  <motion.div
                    className="mt-6 flex flex-col gap-1"
                    variants={mobileMenuListVariants}
                    initial="closed"
                    animate={open ? "open" : "closed"}
                  >
                    <motion.div variants={mobileMenuItemVariants}>
                      <Button variant="ghost" asChild className="w-full justify-start">
                        <Link
                          href="/"
                          onClick={() => setOpen(false)}
                          className="text-zinc-300"
                        >
                          Strona główna
                        </Link>
                      </Button>
                    </motion.div>
                    {navItems.map(({ label, href }) => (
                      <motion.div key={href} variants={mobileMenuItemVariants}>
                        <Button variant="ghost" asChild className="w-full justify-start">
                          <Link
                            href={href}
                            onClick={() => setOpen(false)}
                            className="text-zinc-300"
                          >
                            {label}
                          </Link>
                        </Button>
                      </motion.div>
                    ))}
                    <motion.div variants={mobileMenuItemVariants} className="mt-4 pt-4 border-t border-white/10">
                      <Button asChild className="w-full bg-emerald-600 font-semibold hover:bg-emerald-500">
                        <Link
                          href="/kreator"
                          onClick={() => setOpen(false)}
                        >
                          Zbuduj MVP (80h)
                        </Link>
                      </Button>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
