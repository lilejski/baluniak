"use client";

import type { ComponentType } from "react";
import { motion } from "framer-motion";
import {
  ArrowRightLeft,
  Compass,
  Bot,
  Gauge,
  Globe,
  LayoutDashboard,
  ShoppingBag,
  Workflow,
} from "lucide-react";
import type { Service, ServiceId } from "@/lib/kreator/types";

/** Keys match `service.icon` in the content file; the AI service shows a neutral bot icon. */
const ICONS: Record<string, ComponentType<{ className?: string; strokeWidth?: number }>> = {
  Globe,
  ShoppingBag,
  LayoutDashboard,
  Sparkles: Bot,
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
      <h2 className="text-h3">{heading}</h2>
      <p className="mt-2 text-base text-fg-muted">{hint}</p>

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
              className="card card-interactive group relative flex gap-4 p-5 text-left"
            >
              <Icon className="mt-0.5 size-6 shrink-0 text-accent" strokeWidth={1.5} />
              <span className="min-w-0">
                <span className="text-h4 block">{service.label}</span>
                <span className="mt-1 block text-[0.9375rem] leading-relaxed text-fg-muted">
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
