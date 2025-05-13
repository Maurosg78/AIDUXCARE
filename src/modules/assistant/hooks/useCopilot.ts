import { useState, useCallback } from 'react';
import { trackEvent } from '@/core/lib/langfuse.client';
import type { CopilotSuggestion, SeverityLevel } from '@/types/copilot/CopilotSuggestion';

/**
 * Estructura de la evaluación del paciente
 */
export interface PatientEvaluation {
  id?: string;
  patientId: string;
  visitId?: string;
  voiceApprovedNotes?: string[];
  metadata?: {
    traceId?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Sugerencia estructurada con campos específicos
 */
export interface StructuredSuggestion {
  symptoms?: string[];
  duration?: string;
  currentMedications?: string[];
  allergies?: string[];
  chiefComplaint?: string;
  diagnosis?: string;
  treatmentPlan?: string;
}

/**
 * Props para el hook useCopilot
 */
export interface UseCopilotProps {
  patientEval: PatientEvaluation;
}

/**
 * Resultado del hook useCopilot
 */
export interface UseCopilotResult {
  suggestions: StructuredSuggestion | null;
  isLoading: boolean;
  submitSuggestionFeedback: (field: string, feedback: string, value: string | string[]) => Promise<void>;
  analyzeVoiceNotes: () => Promise<void>;
}

/**
 * Hook para integrar funcionalidades del copiloto en componentes
 * @param param0 Propiedades para el hook
 * @returns Funciones y estado para interactuar con el copiloto
 */
export const useCopilot = ({ patientEval }: UseCopilotProps): UseCopilotResult => {
  const [isLoading] = useState<boolean>(false);
  const [suggestions] = useState<StructuredSuggestion | null>(null);

  /**
   * Enviar feedback sobre una sugerencia propuesta
   * @param field Campo al que se refiere el feedback
   * @param feedback Tipo de feedback (aceptado, rechazado, modificado)
   * @param value Valor propuesto o modificado
   */
  const submitSuggestionFeedback = useCallback(async (
    field: string, 
    feedback: string, 
    value: string | string[]
  ): Promise<void> => {
    await trackEvent({
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

  /**
   * Analizar notas de voz guardadas para sugerencias
   */
  const analyzeVoiceNotes = useCallback(async (): Promise<void> => {
    if (!patientEval.voiceApprovedNotes?.length) return;

    const notes = patientEval.voiceApprovedNotes;
    const hasVoiceNotes = notes.length > 0;

    await trackEvent({
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