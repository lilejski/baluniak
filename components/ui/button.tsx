import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:scale-105 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] dark:bg-emerald-600 dark:text-zinc-950 dark:hover:bg-emerald-500 dark:hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border border-zinc-700 bg-transparent text-white shadow-none hover:bg-zinc-800/50 hover:border-zinc-600 dark:border-zinc-700 dark:bg-transparent dark:text-white dark:hover:bg-zinc-800/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-9 min-h-[2.25rem] px-4 py-2 has-[>svg]:px-3 max-md:min-h-12",
        xs:
          "h-6 gap-1 rounded-full px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3 max-md:min-h-12 max-md:min-w-[3rem]",
        sm:
          "h-8 rounded-full gap-1.5 px-3 has-[>svg]:px-2.5 min-h-[2rem] max-md:min-h-12",
        lg: "h-12 min-h-12 rounded-full px-6 has-[>svg]:px-4",
        icon:
          "size-9 min-h-9 min-w-9 max-md:min-h-12 max-md:min-w-12 max-md:size-12 rounded-full",
        "icon-xs":
          "size-6 rounded-full [&_svg:not([class*='size-'])]:size-3 max-md:min-h-12 max-md:min-w-12",
        "icon-sm":
          "size-8 min-h-8 min-w-8 rounded-full max-md:min-h-12 max-md:min-w-12",
        "icon-lg": "size-12 min-h-12 min-w-12 rounded-full",
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
