import React, { useState, useEffect } from 'react';
import CopilotService, { Suggestion } from '@/modules/copilot/services/CopilotService';
import type { PatientEvaluation } from '@/modules/assistant/hooks/useCopilot';
import { Button } from '@mui/material';
import { trackEvent } from '@/core/lib/langfuse.client';

/**
 * Props para el componente CopilotPanel
 */
interface CopilotPanelProps {
  /**
   * Datos del formulario de evaluación del paciente
   */
  formData: PatientEvaluation;
  /**
   * Callback cuando se aplica una sugerencia
   */
  onApplySuggestion?: (suggestion: Suggestion) => void;
}

/**
 * Panel que muestra sugerencias y retroalimentación del Copilot de IA
 */
const CopilotPanel: React.FC<CopilotPanelProps> = ({ 
  formData, 
  onApplySuggestion 
}) => {
  const [feedback, setFeedback] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analyzeFeedback = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Adaptar los datos al formato que espera el servicio
        const adaptedVisit = {
          id: formData.visitId || 'unknown',
          patientId: formData.patientId,
          visitDate: new Date().toISOString(),
          status: 'in_progress',
          notes: formData.notes || formData.anamnesis || ''
        };
        
        const result = CopilotService.analyzeVisit(adaptedVisit);
        setFeedback(result);
        
        // Track feedback event
        console.log('[Langfuse] Enviando copilot.feedback...');
        const payload = {
          patientId: formData.patientId,
          feedback: JSON.stringify(result),
          formData: JSON.stringify({
            motivo: formData.motivo,
            observations: formData.observations,
            diagnosis: formData.diagnosis
          })
        };
        
        if (formData.metadata?.traceId) {
          await trackEvent({
            name: 'copilot.feedback',
            payload,
            traceId: formData.metadata.traceId
          });
        }
      } catch (err) {
        console.error('Error al analizar feedback:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    };
    
    analyzeFeedback();
  }, [formData]);

  // Componente auxiliar para mostrar el estado de carga
  if (isLoading) {
    return (
      <div>
        <h2>Feedback Clínico</h2>
        <p>Analizando datos clínicos...</p>
      </div>
    );
  }

  // Componente auxiliar para mostrar errores
  if (error) {
    return (
      <div>
        <h2>Feedback Clínico</h2>
        <p style={{ color: 'red' }}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Feedback Clínico</h2>
      {feedback.length === 0 ? (
        <p>No hay sugerencias disponibles para estos datos</p>
      ) : (
        <ul>
          {feedback.map((item, index) => (
            <li key={index}>
              <strong>{item.type}:</strong> {item.message} ({item.severity || 'info'})
              {item.type === 'suggestion' && onApplySuggestion && (
                <Button
                  size="small"
                  onClick={() => onApplySuggestion(item)}
                  sx={{ ml: 1 }}
                >
                  Aplicar
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CopilotPanel; 