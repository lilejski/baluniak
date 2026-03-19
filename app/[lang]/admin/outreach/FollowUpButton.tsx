'use client';

import { useTransition } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { sendFollowUpAction } from './actions';
import { useScheduling } from './SchedulingContext';

interface FollowUpButtonProps {
  leadId: string;
}

export function FollowUpButton({ leadId }: FollowUpButtonProps) {
  const [isPending, startTransition] = useTransition();
  const { scheduleForMorning } = useScheduling();

  const handleFollowUp = () => {
    startTransition(async () => {
      const result = await sendFollowUpAction(leadId, scheduleForMorning);
      if (result?.error) {
        alert(result.error);
      }
    });
  };

  return (
    <button
      onClick={handleFollowUp}
      disabled={isPending}
      title="Send Follow-up"
      className="inline-flex items-center justify-center p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-md transition-colors disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Send className="w-4 h-4" />
      )}
    </button>
  );
}
