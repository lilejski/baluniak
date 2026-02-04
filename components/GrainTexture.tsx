"use client";

import { cn } from "@/lib/utils";

type GrainTextureProps = {
  /** Opacity of the grain overlay (0–1). Keep low for subtle effect. */
  opacity?: number;
  /** Extra class names for the wrapper. */
  className?: string;
};

export function GrainTexture({ opacity = 0.04, className }: GrainTextureProps) {
  return (
    <svg
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 z-0 h-full w-full",
        className
      )}
      style={{ opacity }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <filter id="grain-filter" x="0" y="0">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.65"
          numOctaves="3"
          stitchTiles="stitch"
          result="noise"
        />
        <feColorMatrix
          in="noise"
          type="saturate"
          values="0"
          result="mono"
        />
      </filter>
      <rect width="100%" height="100%" fill="transparent" filter="url(#grain-filter)" />
    </svg>
  );
}
