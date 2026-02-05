"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { GrainTexture } from "@/components/GrainTexture";
import { cn } from "@/lib/utils";

const beamVariants = {
  rest: { rotate: 0 },
  hover: { rotate: 360 },
} as const;

const beamTransition = {
  duration: 3,
  repeat: Infinity,
  ease: "linear",
} as const;

const glowVariants = {
  rest: { opacity: 0 },
  hover: { opacity: 1 },
} as const;

const tiltVariants = {
  rest: { rotateX: 0, rotateY: 0, scale: 1 },
  hover: { rotateX: -2, rotateY: 2, scale: 1.05 },
} as const;

const tiltTransition = { type: "tween", duration: 0.2 } as const;

type Accent = "emerald" | "amber";

const accentConfig: Record<
  Accent,
  { beamBackground: string; glowShadow: string; spotColor: string }
> = {
  emerald: {
    beamBackground:
      "conic-gradient(from 0deg, transparent 0deg 180deg, rgba(16,185,129,0.4) 200deg 280deg, transparent 320deg)",
    glowShadow: "0 0 24px 2px rgba(16,185,129,0.28)",
    spotColor: "rgba(16,185,129,0.45)",
  },
  amber: {
    beamBackground:
      "conic-gradient(from 0deg, transparent 0deg 180deg, rgba(245,158,11,0.35) 200deg 280deg, transparent 320deg)",
    glowShadow: "0 0 24px 2px rgba(245,158,11,0.24)",
    spotColor: "rgba(245,158,11,0.45)",
  },
};

type SpotlightCardProps = {
  /** Grid span classes for the outer wrapper, e.g. `md:col-span-2`. */
  spanClassName?: string;
  /** Accent color for border beam + glow. */
  accent?: Accent;
  /** Extra classes for the inner Card. */
  className?: string;
  children: React.ReactNode;
};

export function SpotlightCard({
  spanClassName,
  accent = "emerald",
  className,
  children,
}: SpotlightCardProps) {
  const accentStyles = accentConfig[accent];

  return (
    <motion.div
      className={cn("group relative overflow-hidden", spanClassName)}
      initial="rest"
      whileHover="hover"
      variants={tiltVariants}
      transition={tiltTransition}
      style={{ transformStyle: "preserve-3d" }}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        event.currentTarget.style.setProperty("--spot-x", `${x}%`);
        event.currentTarget.style.setProperty("--spot-y", `${y}%`);
      }}
    >
      {/* Border beam: rotating accent gradient */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-[2px] z-0 rounded-xl"
        style={{ background: accentStyles.beamBackground }}
        variants={beamVariants}
        transition={beamTransition}
      />

      {/* Subtle glow ring on hover */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-[1px] z-0 rounded-xl opacity-0"
        style={{ boxShadow: accentStyles.glowShadow }}
        variants={glowVariants}
        transition={{ duration: 0.25 }}
      />

      <Card
        className={cn(
          "relative z-10 m-[2px] overflow-hidden border-border bg-zinc-900/50 text-card-foreground shadow-sm backdrop-blur-sm transition-colors",
          className
        )}
      >
        {/* Subtle noise texture in the card background */}
        <GrainTexture
          opacity={0.06}
          position="absolute"
          className="z-0"
        />

        {/* Spotlight hover: soft radial highlight that follows the cursor, accent-colored */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(circle at var(--spot-x, 50%) var(--spot-y, 50%), ${accentStyles.spotColor} 0%, transparent 55%)`,
            mixBlendMode: "screen",
          }}
        />

        {/* Card content above all effects */}
        <div className="relative z-20">
          {children}
        </div>
      </Card>
    </motion.div>
  );
}

