import { useState, useCallback } from 'react';
import { useLangfuse } from '@/core/hooks/useLangfuse';
import { PatientEval } from '@/types/Evaluation';

interface UseCopilotProps {
  patientEval: PatientEval;
}

export const useCopilot = ({ patientEval }: UseCopilotProps) => {
  const [isLoading, setIsLoading] = useState(false);
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

    if (patientEval.voiceApprovedNotes && patientEval.voiceApprovedNotes.length > 0) {
      context.push(
        'Notas validadas por voz:',
        ...patientEval.voiceApprovedNotes.map(note => `- ${note}`)
      );
    }

    return context.join('\n');
  }, [patientEval]);

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
          },
        });
      }

      // Aquí iría la lógica de llamada a la API del copiloto
      // Por ahora retornamos una respuesta simulada
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
  }, [getContext, patientEval.voiceApprovedNotes, trace]);

  return {
    isLoading,
    askQuestion,
  };
}; 