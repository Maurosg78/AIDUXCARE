import React, { useState, useEffect } from 'react';
import CopilotService from '@/modules/ai/CopilotService';
import type { CopilotFeedback } from '@/modules/ai/CopilotService';
import type { PatientEval } from '@/modules/emr/services/EvalService';
import { Button } from '@mui/material';
import { trackEvent } from '@/core/lib/langfuse.client';

interface CopilotPanelProps {
  formData: PatientEval;
  onApplySuggestion?: (feedback: CopilotFeedback) => void;
}

/**
 * Panel que muestra sugerencias y retroalimentación del Copilot de IA
 */
const CopilotPanel: React.FC<CopilotPanelProps> = ({ 
  formData, 
  onApplySuggestion 
}) => {
  const [feedback, setFeedback] = useState<CopilotFeedback[]>([]);

  useEffect(() => {
    const analyzeFeedback = async () => {
      const result = await CopilotService.analyzeEval(formData);
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
      
      if (formData.traceId) {
        await trackEvent({
          name: 'copilot.feedback',
          payload,
          traceId: formData.traceId
        });
      }
    };
    
    analyzeFeedback();
  }, [formData]);

  return (
    <div>
      <h2>Feedback Clínico</h2>
      <ul>
        {feedback.map((item, index) => (
          <li key={index}>
            <strong>{item.type}:</strong> {item.message} ({item.severity})
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
    </div>
  );
};

export default CopilotPanel; 