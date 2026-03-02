"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

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

const navItemsConfig = [
  { labelKey: "navProjects" as const, hash: "#projekty" },
  { labelKey: "navAbout" as const, hash: "#about" },
  { labelKey: "navCaseStudy" as const, path: "/projekty/fotarobota" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { dict, localeSegment } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const isHome = pathname === `/${localeSegment}` || pathname === `/${localeSegment}/`;
    if (isHome) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push(`/${localeSegment}`);
    }
  };

  const navItems = navItemsConfig.map((item) => ({
    label: dict.header[item.labelKey],
    href: "path" in item ? `/${localeSegment}${item.path}` : `/${localeSegment}${item.hash}`,
  }));

  return (
    <header
      className={cn(
        "sticky top-0 z-50 h-16 w-full",
        "border-b border-zinc-800 bg-black/50 backdrop-blur-md"
      )}
      aria-label={dict.header.navAria}
    >
      <nav className="mx-auto flex h-full max-w-6xl items-center justify-between px-5 sm:px-6">
        <Link
          href={`/${localeSegment}`}
          onClick={handleLogoClick}
          className="flex items-center transition-opacity hover:opacity-90"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="flex items-center"
          >
            <Image
              src="/logo-baluniak.svg"
              alt="Bałuniak Logo"
              width={160}
              height={36}
              priority
              className="h-7 w-auto md:h-9"
            />
          </motion.div>
        </Link>

        {/* Desktop: nav + language + Book Call + Build MVP */}
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
          <LanguageSwitcher />
          <Button asChild size="default" className="border-0 bg-blue-600 font-semibold text-white shadow-[0_0_18px_rgba(37,99,235,0.4)] hover:bg-blue-500 hover:shadow-[0_0_22px_rgba(37,99,235,0.5)]">
            <Link href={`/${localeSegment}#contact`}>
              {dict.header.bookCall}
            </Link>
          </Button>
          <Button asChild size="default" className="ml-1">
            <Link
              href={`/${localeSegment}/kreator`}
              className="bg-emerald-600 font-semibold text-emerald-50 shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:bg-emerald-500 hover:text-white"
            >
              <motion.span
                className="inline-block"
                animate={{ opacity: [1, 0.85, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                {dict.header.cta}
              </motion.span>
            </Link>
          </Button>
        </div>

        {/* Mobile: language + burger (thumb-friendly spacing) */}
        <div className="flex items-center gap-3 md:hidden">
          <LanguageSwitcher />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="min-h-12 min-w-12 text-zinc-300 hover:bg-white/10 hover:text-white"
                aria-label={dict.header.openMenu}
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
                      {dict.header.menu}
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
                          href={`/${localeSegment}`}
                          onClick={() => setOpen(false)}
                          className="text-zinc-300"
                        >
                          {dict.header.home}
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
                    <motion.div variants={mobileMenuItemVariants} className="mt-4 border-t border-white/10 pt-4">
                      <LanguageSwitcher inSheet />
                    </motion.div>
                    <motion.div variants={mobileMenuItemVariants}>
                      <Button asChild size="lg" className="w-full border-0 bg-blue-600 font-semibold text-white shadow-[0_0_18px_rgba(37,99,235,0.4)] hover:bg-blue-500">
                        <Link
                          href={`/${localeSegment}#contact`}
                          onClick={() => setOpen(false)}
                        >
                          {dict.header.bookCall}
                        </Link>
                      </Button>
                    </motion.div>
                    <motion.div variants={mobileMenuItemVariants}>
                      <Button asChild size="lg" className="w-full bg-emerald-600 font-semibold text-emerald-50 hover:bg-emerald-500 hover:text-white">
                        <Link
                          href={`/${localeSegment}/kreator`}
                          onClick={() => setOpen(false)}
                        >
                          {dict.header.cta}
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
