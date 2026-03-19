'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SchedulingContextType {
  scheduleForMorning: boolean;
  setScheduleForMorning: (value: boolean) => void;
}

const SchedulingContext = createContext<SchedulingContextType | undefined>(undefined);

export function SchedulingProvider({ children }: { children: React.ReactNode }) {
  const [scheduleForMorning, setScheduleForMorning] = useState(false);

  useEffect(() => {
    // Default to true if current time is between 18:00 and 06:00
    const now = new Date();
    const hour = now.getHours();
    if (hour >= 18 || hour < 6) {
      setScheduleForMorning(true);
    }
  }, []);

  return (
    <SchedulingContext.Provider value={{ scheduleForMorning, setScheduleForMorning }}>
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
