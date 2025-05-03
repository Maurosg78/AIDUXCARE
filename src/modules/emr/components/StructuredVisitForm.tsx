import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { trackEvent } from '@/core/services/langfuseClient';
import { PatientEval } from '@/types/Evaluation';
import debounce from 'lodash/debounce';
import { ActiveListeningPanel } from '@/modules/assistant/components/ActiveListeningPanel';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { useCopilot } from '@/modules/assistant/hooks/useCopilot';

interface StructuredVisitFormProps {
  patientId: string;
  onSubmit: (data: PatientEval) => void;
}

export const StructuredVisitForm: React.FC<StructuredVisitFormProps> = ({
  patientId,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<PatientEval>({
    id: '',
    patientId,
    visitDate: new Date().toISOString(),
    chiefComplaint: '',
    symptoms: [],
    diagnosis: '',
    treatmentPlan: '',
    prognosis: '',
    followUp: '',
    voiceApprovedNotes: [],
    metadata: {
      traceId: '',
      lastUpdated: new Date().toISOString(),
    },
  });

  const { analyzeVoiceNotes, suggestions, isLoading, feedbackState, submitSuggestionFeedback } = useCopilot({
    patientEval: formData,
  });

  const handleChange = useCallback(
    debounce((field: keyof PatientEval, value: string | string[]) => {
      setFormData(prev => ({
        ...prev,
        [field]: value,
        metadata: {
          ...prev.metadata,
          lastUpdated: new Date().toISOString(),
        },
      }));

      trackEvent('form.update', {
        field,
        value,
        patientId,
      }, formData.metadata?.traceId || '');
    }, 500),
    [patientId]
  );

  const handlePhrasesValidated = (result: {
    approvedPhrases: string[];
    rejectedPhrases: string[];
    traceId: string;
  }) => {
    setFormData(prev => ({
      ...prev,
      voiceApprovedNotes: result.approvedPhrases,
      metadata: {
        ...prev.metadata,
        traceId: result.traceId,
        lastUpdated: new Date().toISOString(),
      },
    }));

    trackEvent('voice.notes.approved', {
      approvedCount: result.approvedPhrases.length,
      rejectedCount: result.rejectedPhrases.length,
      patientId,
    }, result.traceId);

    // Analizar las frases validadas
    analyzeVoiceNotes();
  };

  const handleSuggestionAccept = (field: keyof PatientEval, value: string | string[]) => {
    handleChange(field, value);
    trackEvent('copilot.suggestion.accepted', {
      field,
      value,
      patientId,
    }, formData.metadata?.traceId || '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderFieldWithSuggestion = (
    field: keyof PatientEval,
    label: string,
    rows: number = 2,
    isMultiline: boolean = true
  ) => {
    const suggestion = suggestions?.[field as keyof typeof suggestions];
    const hasSuggestion = suggestion !== undefined && suggestion !== null;
    const feedback = feedbackState[field as keyof typeof suggestions];

    const getFeedbackStyle = () => {
      switch (feedback) {
        case 'positive':
          return 'border-green-500 bg-green-50';
        case 'negative':
          return 'border-red-500 bg-red-50';
        case 'ignored':
          return 'opacity-50';
        default:
          return '';
      }
    };

    return (
      <div>
        <label className="block text-sm font-medium mb-1">
          {label}
        </label>
        <div className="relative">
          <TextField
            value={formData[field] as string}
            onChange={(e) => handleChange(field, e.target.value)}
            fullWidth
            multiline={isMultiline}
            rows={rows}
            className={`${hasSuggestion ? 'border-blue-500' : ''} ${getFeedbackStyle()}`}
          />
          {hasSuggestion && !feedback && (
            <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
              <div className="flex items-center gap-2 text-sm text-blue-700 mb-2">
                <span className="text-blue-500">🤖</span>
                Sugerencia del copiloto IA
              </div>
              <div className="text-sm mb-2">
                {Array.isArray(suggestion) ? suggestion.join(', ') : suggestion}
              </div>
              <div className="flex gap-2">
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  onClick={() => handleSuggestionAccept(field, suggestion)}
                >
                  Aceptar sugerencia
                </Button>
                <div className="flex gap-1">
                  <Button
                    size="small"
                    variant="text"
                    color="success"
                    onClick={() => submitSuggestionFeedback(field as keyof typeof suggestions, 'positive', suggestion)}
                  >
                    👍 Útil
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    color="error"
                    onClick={() => submitSuggestionFeedback(field as keyof typeof suggestions, 'negative', suggestion)}
                  >
                    👎 Incorrecta
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    color="inherit"
                    onClick={() => submitSuggestionFeedback(field as keyof typeof suggestions, 'ignored', suggestion)}
                  >
                    🙈 Ignorar
                  </Button>
                </div>
              </div>
            </div>
          )}
          {hasSuggestion && feedback && (
            <div className={`mt-2 p-2 rounded border ${getFeedbackStyle()}`}>
              <div className="flex items-center gap-2 text-sm mb-2">
                {feedback === 'positive' && (
                  <>
                    <span className="text-green-500">✅</span>
                    <span className="text-green-700">Sugerencia útil</span>
                  </>
                )}
                {feedback === 'negative' && (
                  <>
                    <span className="text-red-500">❌</span>
                    <span className="text-red-700">Sugerencia incorrecta</span>
                  </>
                )}
                {feedback === 'ignored' && (
                  <>
                    <span className="text-gray-500">😶</span>
                    <span className="text-gray-700">Sugerencia ignorada</span>
                  </>
                )}
              </div>
              <div className="text-sm">
                {Array.isArray(suggestion) ? suggestion.join(', ') : suggestion}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Frases clínicas validadas por voz</h2>
        <div className="mb-4">
          <Alert type="info" className="mb-4">
            Las frases capturadas por voz son de solo lectura y solo pueden ser modificadas desde el panel de escucha activa.
          </Alert>
          <ActiveListeningPanel onPhrasesValidated={handlePhrasesValidated} />
        </div>
        
        {formData.voiceApprovedNotes && formData.voiceApprovedNotes.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
              <span className="text-blue-500">🎤</span>
              Frases aprobadas vía escucha activa
            </h3>
            <div className="space-y-2">
              {formData.voiceApprovedNotes.map((note: string, index: number) => (
                <div 
                  key={index} 
                  className="p-2 bg-gray-50 rounded text-sm border-l-4 border-blue-500"
                >
                  {note}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Evaluación Clínica</h2>
        
        <div className="space-y-4">
          {renderFieldWithSuggestion('chiefComplaint', 'Motivo de Consulta')}
          {renderFieldWithSuggestion('symptoms', 'Síntomas', 3)}
          {renderFieldWithSuggestion('diagnosis', 'Diagnóstico')}
          {renderFieldWithSuggestion('treatmentPlan', 'Plan de Tratamiento', 3)}
          {renderFieldWithSuggestion('prognosis', 'Pronóstico')}
          {renderFieldWithSuggestion('followUp', 'Seguimiento')}
        </div>

        <div className="mt-6">
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? 'Analizando...' : 'Guardar Evaluación'}
          </Button>
        </div>
      </Card>
    </form>
  );
}; 