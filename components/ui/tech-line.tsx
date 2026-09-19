import { cn } from "@/lib/utils"

/**
 * Technologies as one quiet line of text — "Next.js · Supabase · Vercel" —
 * instead of chips with icons and borders. Only the rendering is shared; the
 * data stays wherever it already lives.
 */
export function TechLine({ items, className }: { items: readonly string[]; className?: string }) {
  if (items.length === 0) return null
  return (
    <p className={cn("text-sm leading-relaxed text-fg-subtle", className)}>{items.join(" · ")}</p>
  )
}
