import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Text input on the shared `field` style. Native <select> and <textarea>
 * elements use the same `field` class directly, so every form on the site —
 * contact form and order builder alike — looks the same.
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(
        "field file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-fg",
        "aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";

export { Input }
