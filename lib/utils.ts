import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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
