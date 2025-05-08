import { useState, useCallback } from 'react';
import { trackEvent } from '@/core/lib/langfuse.client';
import { PatientEval } from '@/types/patient';

interface StructuredSuggestion {
  symptoms?: string[];
  duration?: string;
  currentMedications?: string[];
  allergies?: string[];
  chiefComplaint?: string;
  diagnosis?: string;
  treatmentPlan?: string;
}

interface UseCopilotProps {
  patientEval: PatientEval;
}

export const useCopilot = ({ patientEval }: UseCopilotProps) => {
  const [isLoading] = useState(false);
  const [suggestions] = useState<StructuredSuggestion | null>(null);

  const submitSuggestionFeedback = useCallback(async (field: string, feedback: string, value: string | string[]) => {
    trackEvent({
      name: 'copilot.suggestion.feedback',
      payload: {
        field,
        feedback,
        value: Array.isArray(value) ? JSON.stringify(value) : value,
        source: 'voice'
      },
      traceId: patientEval.metadata?.traceId || ''
    });
  }, [patientEval]);

  const analyzeVoiceNotes = useCallback(async () => {
    if (!patientEval.voiceApprovedNotes?.length) return;

    const notes = patientEval.voiceApprovedNotes;
    const hasVoiceNotes = notes.length > 0;

    trackEvent({
      name: 'copilot.voice.notes.analyzed',
      payload: {
        notesCount: notes.length,
        hasVoiceNotes
      },
      traceId: patientEval.metadata?.traceId || ''
    });
  }, [patientEval]);

  return {
    suggestions,
    isLoading,
    submitSuggestionFeedback,
    analyzeVoiceNotes
  };
}; 