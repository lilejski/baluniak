import * as React from "react"

import { cn } from "@/lib/utils"

type SectionHeadingProps = {
  /** Put on the heading element itself, so aria-labelledby and anchors keep working. */
  id?: string
  eyebrow?: React.ReactNode
  title: React.ReactNode
  lead?: React.ReactNode
  align?: "left" | "center"
  /** h1 for a page header, h2 (default) for a section inside a page. */
  as?: "h1" | "h2"
  className?: string
}

/**
 * The one way a section or a subpage introduces itself: optional eyebrow,
 * heading on the shared type scale, optional lead. Every H2 on the site goes
 * through here or through `text-h2`, so they cannot drift apart again.
 */
export function SectionHeading({
  id,
  eyebrow,
  title,
  lead,
  align = "left",
  as: Heading = "h2",
  className,
}: SectionHeadingProps) {
  const centered = align === "center"
  return (
    <header className={cn("flex flex-col gap-3", centered && "items-center text-center", className)}>
      {eyebrow ? <p className="eyebrow-muted">{eyebrow}</p> : null}
      <Heading id={id} className={cn(Heading === "h1" ? "text-h1" : "text-h2", "text-fg")}>
        {title}
      </Heading>
      {lead ? <p className={cn("text-lead text-fg-muted", centered && "mx-auto")}>{lead}</p> : null}
    </header>
  )
}
