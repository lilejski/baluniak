"use client";

import type { ComponentType } from "react";
import { motion } from "framer-motion";
import {
  ArrowRightLeft,
  Compass,
  Gauge,
  Globe,
  LayoutDashboard,
  ShoppingBag,
  Sparkles,
  Workflow,
} from "lucide-react";
import type { Service, ServiceId } from "@/lib/kreator/types";

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  Globe,
  ShoppingBag,
  LayoutDashboard,
  Sparkles,
  Workflow,
  Gauge,
  ArrowRightLeft,
  Compass,
};

export function ServicePicker({
  services,
  onPick,
  heading,
  hint,
}: {
  services: Service[];
  onPick: (id: ServiceId) => void;
  heading: string;
  hint: string;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">{heading}</h2>
      <p className="mt-2 text-sm text-zinc-500">{hint}</p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {services.map((service, index) => {
          const Icon = ICONS[service.icon] ?? Compass;
          return (
            <motion.button
              key={service.id}
              type="button"
              onClick={() => onPick(service.id)}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.045 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              className="group relative flex gap-4 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 text-left transition-colors hover:border-emerald-500/40 hover:bg-zinc-900 focus-visible:border-emerald-500/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
            >
              <span
                className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden
              />
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-zinc-700/70 bg-zinc-800/60 text-zinc-400 transition-colors group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 group-hover:text-emerald-300">
                <Icon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block font-medium text-zinc-100">{service.label}</span>
                <span className="mt-1 block text-sm leading-relaxed text-zinc-500">
                  {service.blurb}
                </span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
