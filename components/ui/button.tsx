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
          "relative border border-white/10 bg-white/5 text-zinc-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md hover:bg-white/10 hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.25),inset_0_1px_0_0_rgba(255,255,255,0.2)] dark:hover:bg-white/10 dark:hover:border-emerald-500/40",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border border-zinc-700 bg-transparent text-white shadow-none hover:bg-zinc-800/50 hover:border-zinc-600 dark:border-zinc-700 dark:bg-transparent dark:text-white dark:hover:bg-zinc-800/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        glass:
          "relative overflow-hidden bg-white/[0.03] text-zinc-100 border border-white/[0.08] shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.1)] backdrop-blur-md hover:bg-white/[0.08] hover:border-emerald-500/30 hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.15),0_0_20px_0_rgba(16,185,129,0.15)] transition-all duration-300",
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
