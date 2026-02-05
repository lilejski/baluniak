"use client";

import { useEffect, useState } from "react";
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

type Beam = {
  id: number;
  orientation: "horizontal" | "vertical";
  offsetPercent: number;
  delay: number;
  duration: number;
};

const BEAM_COUNT = 10;

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

  const style = lineStyle ?? dotStyle;

  const [beams, setBeams] = useState<Beam[]>([]);

  // Generate beam positions and timings on the client to avoid hydration mismatch.
  useEffect(() => {
    const generated: Beam[] = Array.from({ length: BEAM_COUNT }).map((_, index) => {
      const orientation: Beam["orientation"] =
        index % 2 === 0 ? "horizontal" : "vertical";

      return {
        id: index,
        orientation,
        offsetPercent: Math.random() * 100,
        delay: Math.random() * 14,
        duration: 10 + Math.random() * 16,
      };
    });

    setBeams(generated);
  }, []);

  const maskStyle =
    variant === "lines"
      ? ({
          WebkitMaskImage:
            "radial-gradient(ellipse 120% 100% at 50% 35%, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 45%, transparent 80%)",
          maskImage:
            "radial-gradient(ellipse 120% 100% at 50% 35%, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 45%, transparent 80%)",
        } satisfies React.CSSProperties)
      : undefined;

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 z-0 overflow-hidden",
        className
      )}
      style={maskStyle}
    >
      {/* Base grid (lines or dots) */}
      <div className="absolute inset-0" style={style} />

      {/* Cyberpunk glow washes + traveling beams (lines only) */}
      {variant === "lines" && (
        <>
          {/* Soft radial glows for depth */}
          <div
            className="absolute inset-0 mix-blend-screen"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 0%, rgba(56,189,248,0.22), transparent 55%), radial-gradient(circle at 80% 100%, rgba(245,158,11,0.22), transparent 55%)",
            }}
          />

          {/* Randomized glowing beams moving along grid lines */}
          {beams.map((beam) =>
            beam.orientation === "horizontal" ? (
              <div
                key={beam.id}
                className="pointer-events-none absolute -left-1/3 -right-1/3 mix-blend-screen"
                style={{
                  top: `${beam.offsetPercent}%`,
                  height: 2,
                  backgroundImage:
                    "linear-gradient(90deg, rgba(56,189,248,0) 0%, rgba(56,189,248,0.95) 50%, rgba(56,189,248,0) 100%)",
                  animation: `cyber-grid-beam-x ${beam.duration}s linear infinite`,
                  animationDelay: `${beam.delay}s`,
                  willChange: "transform, opacity",
                }}
              />
            ) : (
              <div
                key={beam.id}
                className="pointer-events-none absolute -top-1/3 -bottom-1/3 mix-blend-screen"
                style={{
                  left: `${beam.offsetPercent}%`,
                  width: 2,
                  backgroundImage:
                    "linear-gradient(180deg, rgba(245,158,11,0) 0%, rgba(245,158,11,0.95) 50%, rgba(245,158,11,0) 100%)",
                  animation: `cyber-grid-beam-y ${beam.duration}s linear infinite`,
                  animationDelay: `${beam.delay}s`,
                  willChange: "transform, opacity",
                }}
              />
            )
          )}
        </>
      )}
    </div>
  );
}
