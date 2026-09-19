"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Accent = "emerald" | "amber";

type SpotlightCardProps = {
  /** Grid span classes for the outer wrapper, e.g. `md:col-span-2`. */
  spanClassName?: string;
  /** Kept for API compatibility; the site now has a single accent colour. */
  accent?: Accent;
  /** Extra classes for the inner Card. */
  className?: string;
  children: React.ReactNode;
};

/**
 * A clickable card on the shared card style. The rotating border beam,
 * cursor spotlight, tilt and grain are gone — hover only lifts the border.
 */
export function SpotlightCard({
  spanClassName,
  className,
  children,
}: SpotlightCardProps) {
  return (
    <div className={cn("group relative", spanClassName)}>
      <Card className={cn("card-interactive relative h-full", className)}>
        {children}
      </Card>
    </div>
  );
}
