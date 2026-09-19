import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * One button system for the whole site.
 *
 * default = primary (brand green), secondary = outlined, ghost = text that
 * underlines on hover, link = inline accent link. `outline` and `glass` are
 * kept as aliases of `secondary` so older call sites keep type-checking.
 * No glow, gradients, shadows or scaling; an arrow icon nudges 2px on hover.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md font-sans text-[0.9375rem] font-semibold leading-none transition-colors duration-150 motion-reduce:transition-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg.lucide-arrow-right]:transition-transform [&_svg.lucide-arrow-right]:duration-150 hover:[&_svg.lucide-arrow-right]:translate-x-[2px] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-focus aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-accent text-accent-ink hover:bg-accent-hover active:bg-accent-press",
        secondary:
          "border border-border-strong bg-transparent text-fg hover:border-fg-subtle hover:bg-surface-2",
        outline:
          "border border-border-strong bg-transparent text-fg hover:border-fg-subtle hover:bg-surface-2",
        glass:
          "border border-border-strong bg-transparent text-fg hover:border-fg-subtle hover:bg-surface-2",
        ghost:
          "text-fg-muted underline-offset-4 hover:text-fg hover:underline",
        link:
          "text-accent underline underline-offset-4 hover:text-accent-hover",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90",
      },
      size: {
        default: "h-12 px-5 md:h-11",
        sm: "h-10 px-4",
        lg: "h-12 px-6",
        xs: "h-8 px-3 text-[0.8125rem]",
        icon: "size-11",
        "icon-xs": "size-8",
        "icon-sm": "size-10",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
