'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useScheduling, ScheduleType } from './SchedulingContext';
import { sendBatchAction } from './actions';

export function BatchSendButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ message?: string; error?: string } | null>(null);
  const [templateType, setTemplateType] = useState('general_photo');
  const { 
    scheduleType, 
    setScheduleType, 
    customDateTime, 
    setCustomDateTime, 
    getScheduledAtISO 
  } = useScheduling();
  const router = useRouter();

  async function handleSendBatch() {
    setIsLoading(true);
    setResult(null);

    try {
      const scheduledAt = getScheduledAtISO();
      const data = await sendBatchAction(templateType, scheduledAt);
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setResult({ message: `Success! Sent ${data.sentCount} emails.` });
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setResult({ error: err.message || 'An unexpected error occurred.' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <select
          value={templateType}
          onChange={(e) => setTemplateType(e.target.value)}
          disabled={isLoading}
          className="bg-zinc-950 border border-zinc-700 text-zinc-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-3 py-2.5 transition-colors disabled:opacity-50"
        >
          <option value="general_photo">1. Zimny start (Uniwersalne zdjęcie)</option>
          <option value="personalized_photo">2. Snajper (Dedykowane zdjęcie)</option>
          <option value="follow_up">3. Follow-up (Przypomnienie)</option>
        </select>

        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <label htmlFor="schedule-type" className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Planuj:</label>
            <select
              id="schedule-type"
              value={scheduleType}
              onChange={(e) => setScheduleType(e.target.value as ScheduleType)}
              disabled={isLoading}
              className="bg-zinc-950 border border-zinc-700 text-zinc-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-3 py-2 transition-colors disabled:opacity-50"
            >
              <option value="immediate">Natychmiast</option>
              <option value="morning">Rano (08:30)</option>
              <option value="noon">Południe (12:00)</option>
              <option value="evening">Wieczór (19:00)</option>
              <option value="custom">Niestandardowe</option>
            </select>
          </div>

          {scheduleType === 'custom' && (
            <input
              type="datetime-local"
              value={customDateTime}
              onChange={(e) => setCustomDateTime(e.target.value)}
              disabled={isLoading}
              className="bg-zinc-950 border border-zinc-700 text-zinc-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-3 py-2 transition-colors disabled:opacity-50"
            />
          )}

          <button
            onClick={handleSendBatch}
            disabled={isLoading}
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </>
          ) : (
            'Send Batch (5 emails)'
          )}
        </button>
      </div>
    </div>
      {result && (
        <p className={`text-sm ${result.error ? 'text-red-400' : 'text-emerald-400'}`}>
          {result.error || result.message}
        </p>
      )}
    </div>
  );
}
