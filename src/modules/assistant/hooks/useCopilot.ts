import { useState, useCallback } from 'react';
import { useLangfuse } from '@/core/hooks/useLangfuse';
import { PatientEval } from '@/types/Evaluation';

interface UseCopilotProps {
  patientEval: PatientEval;
}

interface StructuredSuggestion {
  symptoms?: string[];
  duration?: string;
  currentMedications?: string[];
  allergies?: string[];
  chiefComplaint?: string;
  diagnosis?: string;
  treatmentPlan?: string;
}

export const useCopilot = ({ patientEval }: UseCopilotProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<StructuredSuggestion | null>(null);
  const { trace } = useLangfuse();

  const getContext = useCallback(() => {
    const context = [
      `Motivo de consulta: ${patientEval.chiefComplaint || ''}`,
      `Síntomas: ${(patientEval.symptoms || []).join(', ')}`,
      `Diagnóstico: ${patientEval.diagnosis || ''}`,
      `Plan de tratamiento: ${patientEval.treatmentPlan || ''}`,
      `Pronóstico: ${patientEval.prognosis || ''}`,
      `Seguimiento: ${patientEval.followUp || ''}`,
    ];

    if (patientEval.voiceApprovedNotes?.length > 0) {
      context.push(
        '// source: audioValidated',
        'Contexto clínico hablado (aprobado por el profesional):',
        ...patientEval.voiceApprovedNotes.map(note => `- ${note}`)
      );

      if (trace) {
        trace.event({
          name: 'copilot.context.updated',
          metadata: {
            source: 'voice',
            notes: patientEval.voiceApprovedNotes,
            traceId: patientEval.metadata?.traceId,
          },
        });
      }
    }

    return context.join('\n');
  }, [patientEval, trace]);

  const analyzeVoiceNotes = useCallback(async () => {
    if (!patientEval.voiceApprovedNotes?.length) return null;

    setIsLoading(true);
    try {
      const context = getContext();
      const prompt = `
Analiza estas frases clínicas habladas y sugiere posibles valores para los campos estructurados del EMR como: síntomas, duración, tratamientos actuales, alergias, etc.
Responde en formato JSON con la siguiente estructura:
{
  "symptoms": string[],
  "duration": string,
  "currentMedications": string[],
  "allergies": string[],
  "chiefComplaint": string,
  "diagnosis": string,
  "treatmentPlan": string
}

Contexto clínico hablado:
${patientEval.voiceApprovedNotes.join('\n')}
`;

      // Aquí iría la llamada real al LLM
      // Por ahora simulamos una respuesta
      const mockResponse: StructuredSuggestion = {
        symptoms: ['Dolor en brazo derecho'],
        duration: '2 semanas',
        currentMedications: ['Ibuprofeno'],
        allergies: ['Penicilina'],
        chiefComplaint: 'Dolor en brazo derecho de 2 semanas de evolución',
        diagnosis: 'Posible tendinitis',
        treatmentPlan: 'Suspender ibuprofeno y considerar antiinflamatorio tópico',
      };

      setSuggestions(mockResponse);

      if (trace) {
        trace.event({
          name: 'copilot.suggestion.generated',
          metadata: {
            source: 'voice',
            traceId: patientEval.metadata?.traceId,
            suggestedFields: Object.keys(mockResponse),
            llmResponse: mockResponse,
          },
        });
      }

      return mockResponse;
    } catch (error) {
      console.error('Error al analizar notas de voz:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [patientEval.voiceApprovedNotes, getContext, trace]);

  const askQuestion = useCallback(async (question: string) => {
    setIsLoading(true);
    try {
      const context = getContext();
      
      if (trace) {
        trace.event({
          name: 'copilot.question',
          metadata: {
            question,
            hasVoiceNotes: patientEval.voiceApprovedNotes?.length > 0,
            traceId: patientEval.metadata?.traceId,
          },
        });
      }

      // Aquí iría la lógica de llamada a la API del copiloto
      return {
        answer: `Basado en la información clínica y las notas de voz, ${question}`,
        context,
      };
    } catch (error) {
      console.error('Error al consultar al copiloto:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [getContext, patientEval, trace]);

  return {
    isLoading,
    askQuestion,
    analyzeVoiceNotes,
    suggestions,
  };
}; 