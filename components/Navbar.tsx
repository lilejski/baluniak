"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronDown, Menu } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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

/** The case studies, shown under "Projects" instead of as top-level items. */
const projectItemsConfig = [
  { labelKey: "navFotarobota" as const, path: "/projekty/fotarobota" },
  { labelKey: "navQuantumOm" as const, path: "/projekty/quantum-om" },
  { labelKey: "navCharon" as const, path: "/projekty/charon" },
] as const;

const navItemsConfig = [
  { labelKey: "navAbout" as const, path: "/o-mnie" },
  { labelKey: "navBlog" as const, path: "/blog" },
] as const;

const desktopLink =
  "whitespace-nowrap rounded-md px-2.5 py-2 text-[0.9375rem] font-medium transition-colors hover:text-fg";
const activeLink = "text-fg underline decoration-accent decoration-2 underline-offset-[10px]";

export function Navbar() {
  const [open, setOpen] = useState(false);

  // The Projects menu opens on hover, because a pointer already over it has
  // said what it wants. The small closing delay covers the gap between the
  // trigger and the panel, so crossing it does not slam the menu shut.
  const [projectsOpen, setProjectsOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  const openProjects = () => {
    cancelClose();
    setProjectsOpen(true);
  };
  const closeProjectsSoon = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setProjectsOpen(false), 140);
  };
  useEffect(() => cancelClose, []);
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

  const isCurrent = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);

  const projectsHref = `/${localeSegment}#projekty`;
  const projectItems = projectItemsConfig.map((item) => {
    const href = `/${localeSegment}${item.path}`;
    return { label: dict.header[item.labelKey], href, active: isCurrent(href) };
  });
  const projectsActive = projectItems.some((item) => item.active);

  const navItems = navItemsConfig.map((item) => {
    const href = `/${localeSegment}${item.path}`;
    return { label: dict.header[item.labelKey], href, active: isCurrent(href) };
  });

  return (
    <header
      className={cn(
        "sticky top-0 z-50 h-16 w-full md:h-20 print:hidden",
        "border-b border-border bg-bg/85 backdrop-blur-md"
      )}
      aria-label={dict.header.navAria}
    >
      <nav className="container-page flex h-full items-center justify-between gap-4">
        <Link
          href={`/${localeSegment}`}
          onClick={handleLogoClick}
          className="relative z-10 flex flex-shrink-0 items-center rounded-md"
        >
          <Image
            src="/logo-baluniak.svg"
            alt="Bałuniak Logo"
            width={500}
            height={125}
            priority
            className="static h-12 w-auto md:h-16"
          />
        </Link>

        {/* Desktop: projects menu + links + language + book a call (primary) + order (secondary) */}
        <div className="hidden items-center gap-1 lg:flex">
          <DropdownMenu.Root modal={false} open={projectsOpen} onOpenChange={setProjectsOpen}>
            <DropdownMenu.Trigger
              onMouseEnter={openProjects}
              onMouseLeave={closeProjectsSoon}
              // Radix toggles on pointer-down. With hover driving the menu that
              // would close it the moment the pointer arrives, so mouse presses
              // are ignored here — touch still needs the tap to open it.
              onPointerDown={(event) => {
                if (event.pointerType !== "touch") event.preventDefault();
              }}
              className={cn(
                desktopLink,
                "group inline-flex items-center gap-1 outline-none",
                projectsActive ? activeLink : "text-fg-muted"
              )}
            >
              {dict.header.navProjects}
              <ChevronDown
                className="size-4 transition-transform duration-150 group-data-[state=open]:rotate-180"
                aria-hidden
              />
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="start"
                sideOffset={10}
                onMouseEnter={openProjects}
                onMouseLeave={closeProjectsSoon}
                className="card z-[60] min-w-60 p-1.5 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
              >
                <DropdownMenu.Item asChild onSelect={() => setProjectsOpen(false)}>
                  <Link
                    href={projectsHref}
                    className="flex min-h-10 items-center rounded-sm px-3 text-[0.9375rem] text-fg-muted outline-none data-[highlighted]:bg-surface-2 data-[highlighted]:text-fg"
                  >
                    {dict.projects.allProjects}
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1.5 h-px bg-border" />
                {projectItems.map(({ label, href, active }) => (
                  <DropdownMenu.Item key={href} asChild onSelect={() => setProjectsOpen(false)}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-10 items-center rounded-sm px-3 font-display text-[0.9375rem] font-semibold outline-none data-[highlighted]:bg-surface-2 data-[highlighted]:text-fg",
                        active ? "text-accent" : "text-fg"
                      )}
                    >
                      {label}
                    </Link>
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          {navItems.map(({ label, href, active }) => (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(desktopLink, active ? activeLink : "text-fg-muted")}
            >
              {label}
            </Link>
          ))}
          <div className="ml-2">
            <LanguageSwitcher />
          </div>
          <Button asChild size="sm" className="ml-2">
            <Link href={`/${localeSegment}#contact`}>
              {dict.header.bookCall}
            </Link>
          </Button>
          <Button asChild size="sm" variant="secondary" className="ml-1">
            <Link href={`/${localeSegment}/kreator`}>
              {dict.header.cta}
            </Link>
          </Button>
        </div>

        {/* Mobile: language + burger (thumb-friendly spacing) */}
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-fg-muted hover:bg-surface-2 hover:text-fg hover:no-underline"
                aria-label={dict.header.openMenu}
              >
                <Menu className="size-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="overflow-y-auto border-border bg-bg"
            >
              <div className="flex h-full flex-col">
                <SheetHeader>
                  <SheetTitle className="text-left text-h4 text-fg">
                    {dict.header.menu}
                  </SheetTitle>
                </SheetHeader>
                <motion.div
                  className="mt-2 flex flex-col gap-1 px-4 pb-6"
                  variants={mobileMenuListVariants}
                  initial="closed"
                  animate={open ? "open" : "closed"}
                >
                  <motion.div variants={mobileMenuItemVariants}>
                    <Link
                      href={`/${localeSegment}`}
                      onClick={() => setOpen(false)}
                      className="flex min-h-12 items-center rounded-md px-3 text-base font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
                    >
                      {dict.header.home}
                    </Link>
                  </motion.div>

                  {/* Projects, with the case studies nested under them */}
                  <motion.div variants={mobileMenuItemVariants}>
                    <Link
                      href={projectsHref}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex min-h-12 items-center rounded-md px-3 text-base font-medium transition-colors hover:bg-surface-2 hover:text-fg",
                        projectsActive ? "text-fg" : "text-fg-muted"
                      )}
                    >
                      {dict.header.navProjects}
                    </Link>
                    <div className="ml-3 flex flex-col border-l border-border pl-2">
                      {projectItems.map(({ label, href, active }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex min-h-11 items-center rounded-md px-3 text-[0.9375rem] transition-colors hover:bg-surface-2 hover:text-fg",
                            active ? "text-accent" : "text-fg-subtle"
                          )}
                        >
                          {label}
                        </Link>
                      ))}
                    </div>
                  </motion.div>

                  {navItems.map(({ label, href, active }) => (
                    <motion.div key={href} variants={mobileMenuItemVariants}>
                      <Link
                        href={href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex min-h-12 items-center rounded-md px-3 text-base font-medium transition-colors hover:bg-surface-2 hover:text-fg",
                          active ? "text-fg" : "text-fg-muted"
                        )}
                      >
                        {label}
                      </Link>
                    </motion.div>
                  ))}
                  <motion.div variants={mobileMenuItemVariants} className="mt-4 border-t border-border pt-4">
                    <LanguageSwitcher inSheet />
                  </motion.div>
                  <motion.div variants={mobileMenuItemVariants} className="mt-4">
                    <Button asChild size="lg" className="w-full">
                      <Link
                        href={`/${localeSegment}#contact`}
                        onClick={() => setOpen(false)}
                      >
                        {dict.header.bookCall}
                      </Link>
                    </Button>
                  </motion.div>
                  <motion.div variants={mobileMenuItemVariants} className="mt-2">
                    <Button asChild size="lg" variant="secondary" className="w-full">
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
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
