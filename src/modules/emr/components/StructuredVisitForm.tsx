import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { trackEvent } from '@/core/services/langfuseClient';
import { PatientEval } from '@/types/Evaluation';
import debounce from 'lodash/debounce';
import { ActiveListeningPanel } from '@/modules/assistant/components/ActiveListeningPanel';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

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
      }, formData.metadata?.traceId);
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
          <div>
            <label className="block text-sm font-medium mb-1">
              Motivo de Consulta
            </label>
            <TextField
              value={formData.chiefComplaint}
              onChange={(e) => handleChange('chiefComplaint', e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Síntomas
            </label>
            <TextField
              value={formData.symptoms?.join('\n')}
              onChange={(e) => handleChange('symptoms', e.target.value.split('\n'))}
              fullWidth
              multiline
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Diagnóstico
            </label>
            <TextField
              value={formData.diagnosis}
              onChange={(e) => handleChange('diagnosis', e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Plan de Tratamiento
            </label>
            <TextField
              value={formData.treatmentPlan}
              onChange={(e) => handleChange('treatmentPlan', e.target.value)}
              fullWidth
              multiline
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Pronóstico
            </label>
            <TextField
              value={formData.prognosis}
              onChange={(e) => handleChange('prognosis', e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Seguimiento
            </label>
            <TextField
              value={formData.followUp}
              onChange={(e) => handleChange('followUp', e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
          </div>
        </div>

        <div className="mt-6">
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
          >
            Guardar Evaluación
          </Button>
        </div>
      </Card>
    </form>
  );
}; 