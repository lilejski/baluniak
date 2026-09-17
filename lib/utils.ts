import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// The type scale lives in globals.css as custom utilities (text-h1 … text-h4,
// text-lead). Without telling tailwind-merge they are font sizes, it files them
// under text colour and silently drops them next to e.g. `text-fg`.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["h1", "h2", "h3", "h4", "lead"] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateScheduledTime(type: string, customValue?: string) {
  const now = new Date();
  
  if (type === 'immediate') return null;
  if (type === 'custom' && customValue) return new Date(customValue);
  
  let targetHour = 8;
  let targetMinute = 30;
  
  if (type === 'morning') {
    targetHour = 8;
    targetMinute = 30;
  } else if (type === 'noon') {
    targetHour = 12;
    targetMinute = 0;
  } else if (type === 'evening') {
    targetHour = 19;
    targetMinute = 0;
  }
  
  const scheduledAt = new Date(now);
  scheduledAt.setHours(targetHour, targetMinute, 0, 0);
  
  // If the target time for today has already passed, schedule for tomorrow
  if (scheduledAt <= now) {
    scheduledAt.setDate(now.getDate() + 1);
  }
  
  return scheduledAt;
}
