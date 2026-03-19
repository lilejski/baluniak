import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getScheduledAt() {
  const now = new Date();
  const hour = now.getHours();
  
  // 18:00 - 06:00 window (Off-hours)
  if (hour >= 18 || hour < 6) {
    const scheduledAt = new Date(now);
    if (hour >= 18) {
      scheduledAt.setDate(now.getDate() + 1);
    }
    scheduledAt.setHours(8, 0, 0, 0);
    return scheduledAt;
  }
  return null;
}
