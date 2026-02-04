"use client";

import { cn } from "@/lib/utils";

const DEFAULT_SIZE = 40;
/** Very low opacity (e.g. Tailwind opacity-20 = 0.2) for a subtle grid/dot pattern. */
const DEFAULT_OPACITY = 0.2;

type BackgroundGridProps = {
  /** Grid cell size in pixels. */
  size?: number;
  /** Line opacity (0–1). */
  opacity?: number;
  /** Optional CSS color (e.g. white, rgb). */
  color?: string;
  /** Extra class names for the wrapper. */
  className?: string;
  /** Whether to use a dot grid instead of lines. */
  variant?: "lines" | "dots";
};

export function BackgroundGrid({
  size = DEFAULT_SIZE,
  opacity = DEFAULT_OPACITY,
  color = "255, 255, 255",
  className,
  variant = "lines",
}: BackgroundGridProps) {
  const lineStyle =
    variant === "lines"
      ? {
          backgroundImage: `
            linear-gradient(to right, rgba(${color}, ${opacity}) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(${color}, ${opacity}) 1px, transparent 1px)
          `,
          backgroundSize: `${size}px ${size}px`,
        }
      : undefined;

  const dotStyle =
    variant === "dots"
      ? {
          backgroundImage: `radial-gradient(circle at center, rgba(${color}, ${opacity}) 1px, transparent 1px)`,
          backgroundSize: `${size}px ${size}px`,
        }
      : undefined;

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none fixed inset-0 z-0", className)}
      style={lineStyle ?? dotStyle}
    />
  );
}
