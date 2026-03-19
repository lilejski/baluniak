'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { calculateScheduledTime } from '@/lib/utils';

export type ScheduleType = 'immediate' | 'morning' | 'noon' | 'evening' | 'custom';

interface SchedulingContextType {
  scheduleType: ScheduleType;
  setScheduleType: (value: ScheduleType) => void;
  customDateTime: string;
  setCustomDateTime: (value: string) => void;
  getScheduledAtISO: () => string | null;
}

const SchedulingContext = createContext<SchedulingContextType | undefined>(undefined);

export function SchedulingProvider({ children }: { children: React.ReactNode }) {
  const [scheduleType, setScheduleType] = useState<ScheduleType>('immediate');
  const [customDateTime, setCustomDateTime] = useState('');

  // Default to morning if it's currently late (as per previous requirement, or just let user choose)
  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    if (hour >= 18 || hour < 6) {
      setScheduleType('morning');
    }
  }, []);

  const getScheduledAtISO = () => {
    const date = calculateScheduledTime(scheduleType, customDateTime);
    return date ? date.toISOString() : null;
  };

  return (
    <SchedulingContext.Provider value={{ 
      scheduleType, 
      setScheduleType, 
      customDateTime, 
      setCustomDateTime,
      getScheduledAtISO 
    }}>
      {children}
    </SchedulingContext.Provider>
  );
}

export function useScheduling() {
  const context = useContext(SchedulingContext);
  if (context === undefined) {
    throw new Error('useScheduling must be used within a SchedulingProvider');
  }
  return context;
}
