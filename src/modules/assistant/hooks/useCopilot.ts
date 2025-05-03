import { useState, useCallback } from 'react';
import { trackEvent } from '@/core/services/langfuseClient';
import { PatientEval } from '@/types/patient';
import { CopilotSuggestion } from '../types';

interface StructuredSuggestion {
  symptoms?: string[];
  duration?: string;
  currentMedications?: string[];
  allergies?: string[];
  chiefComplaint?: string;
  diagnosis?: string;
  treatmentPlan?: string;
}

// Simulación de análisis basado en palabras clave
const KEYWORDS = {
  chiefComplaint: ['dolor', 'molestia', 'dificultad', 'limitación'],
  symptoms: ['inflamación', 'rigidez', 'debilidad', 'espasmo'],
  diagnosis: ['tendinitis', 'esguince', 'contractura', 'lumbalgia'],
  treatmentPlan: ['ejercicios', 'terapia', 'movilización', 'estiramientos']
};

interface UseCopilotProps {
  patientEval: PatientEval;
  onSuggestionAccepted?: (field: string, value: string) => void;
}

export const useCopilot = ({ patientEval, onSuggestionAccepted }: UseCopilotProps) => {
  const [isLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<CopilotSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

  const analyzeVoiceNotes = useCallback(async (notes: string[]) => {
    setIsAnalyzing(true);
    console.log('🤖 Analizando notas de voz:', notes);

    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newSuggestions: CopilotSuggestion[] = [];

    notes.forEach(note => {
      const noteLower = note.toLowerCase();

      // Analizar cada campo buscando palabras clave
      Object.entries(KEYWORDS).forEach(([field, keywords]) => {
        const matchingKeywords = keywords.filter(keyword => 
          noteLower.includes(keyword.toLowerCase())
        );

        if (matchingKeywords.length > 0) {
          newSuggestions.push({
            field: field as CopilotSuggestion['field'],
            text: note
          });
        }
      });
    });

    console.log('🤖 Sugerencias generadas:', newSuggestions);
    setSuggestions(newSuggestions);
    setIsAnalyzing(false);

    return newSuggestions;
  }, []);

  const acceptSuggestion = useCallback((suggestion: CopilotSuggestion) => {
    console.log('🤖 Sugerencia aceptada:', suggestion);
    onSuggestionAccepted?.(suggestion.field, suggestion.text);
    setSuggestions(prev => prev.filter(s => s !== suggestion));
  }, [onSuggestionAccepted]);

  const rejectSuggestion = useCallback((suggestion: CopilotSuggestion) => {
    console.log('🤖 Sugerencia rechazada:', suggestion);
    setSuggestions(prev => prev.filter(s => s !== suggestion));
  }, []);

  return {
    suggestions,
    isLoading,
    isAnalyzing,
    submitSuggestionFeedback,
    analyzeVoiceNotes,
    acceptSuggestion,
    rejectSuggestion
  };
}; 