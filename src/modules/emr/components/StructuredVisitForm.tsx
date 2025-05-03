import React, { useState } from 'react';
import { TextField, Button, IconButton, Collapse } from '@mui/material';
import { trackEvent } from '@/core/services/langfuseClient';
import { PatientEval } from '@/types/Evaluation';
import { useCopilot } from '@/modules/assistant/hooks/useCopilot';
import { ActiveListeningPanel } from '@/modules/assistant/components/ActiveListeningPanel';
import { CheckCircle, Cancel, VisibilityOff } from '@mui/icons-material';

interface StructuredVisitFormProps {
  patientId: string;
  onSubmit: (data: PatientEval) => void;
  initialData?: Partial<PatientEval>;
}

export const StructuredVisitForm: React.FC<StructuredVisitFormProps> = ({
  patientId,
  onSubmit,
  initialData = {},
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
    metadata: {
      traceId: '',
      lastUpdated: new Date().toISOString(),
    },
    voiceApprovedNotes: [],
    ...initialData,
  });

  const { suggestions, isLoading, submitSuggestionFeedback } = useCopilot({ patientEval: formData });

  const handleChange = (field: keyof PatientEval) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newValue = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: field === 'symptoms' ? newValue.split(', ') : newValue,
      metadata: {
        ...prev.metadata,
        lastUpdated: new Date().toISOString(),
      },
    }));

    trackEvent({
      name: 'emr.field.update',
      payload: {
        field,
        value: newValue,
        patientId
      },
      traceId: formData.metadata?.traceId || ''
    });
  };

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

    trackEvent({
      name: 'emr.voice.notes.validated',
      payload: {
        approvedCount: result.approvedPhrases.length,
        rejectedCount: result.rejectedPhrases.length,
        patientId
      },
      traceId: result.traceId
    });
  };

  const handleSuggestionFeedback = (
    field: 'chiefComplaint' | 'symptoms' | 'diagnosis' | 'treatmentPlan',
    feedback: 'positive' | 'negative' | 'ignored',
    value: string | string[]
  ) => {
    if (value) {
      submitSuggestionFeedback(field, feedback, value);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(formData);
  };

  const [showActiveListening, setShowActiveListening] = useState(false);

  return (
    <form onSubmit={handleSubmit} className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Sección: Motivo de Consulta */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-slate-800">Motivo de Consulta</h3>
          <div className="bg-white rounded-2xl shadow-md p-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Motivo Principal
            </label>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={formData.chiefComplaint}
              onChange={handleChange('chiefComplaint')}
              variant="outlined"
              className="bg-slate-50"
            />
            {suggestions?.chiefComplaint && (
              <div className="mt-2 p-3 border-l-4 border-blue-400 bg-blue-50 rounded-r-lg animate-fade-in">
                <div className="flex items-start gap-2">
                  <span className="text-xl">🤖</span>
                  <div className="flex-1">
                    <p className="text-sm text-slate-700">{suggestions.chiefComplaint}</p>
                    <div className="mt-2 flex gap-2">
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            chiefComplaint: suggestions.chiefComplaint || '',
                          }));
                          handleSuggestionFeedback('chiefComplaint', 'positive', suggestions.chiefComplaint || '');
                        }}
                        startIcon={<CheckCircle />}
                      >
                        Aceptar
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => handleSuggestionFeedback('chiefComplaint', 'negative', suggestions.chiefComplaint || '')}
                        aria-label="Rechazar sugerencia"
                      >
                        <Cancel />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleSuggestionFeedback('chiefComplaint', 'ignored', suggestions.chiefComplaint || '')}
                        aria-label="Ignorar sugerencia"
                      >
                        <VisibilityOff />
                      </IconButton>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sección: Síntomas */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-slate-800">Síntomas</h3>
          <div className="bg-white rounded-2xl shadow-md p-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Descripción de Síntomas
            </label>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={formData.symptoms?.join(', ') || ''}
              onChange={handleChange('symptoms')}
              variant="outlined"
              className="bg-slate-50"
            />
            {suggestions?.symptoms && (
              <div className="mt-2 p-3 border-l-4 border-blue-400 bg-blue-50 rounded-r-lg animate-fade-in">
                <div className="flex items-start gap-2">
                  <span className="text-xl">🤖</span>
                  <div className="flex-1">
                    <p className="text-sm text-slate-700">{suggestions.symptoms.join(', ')}</p>
                    <div className="mt-2 flex gap-2">
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            symptoms: suggestions.symptoms || [],
                          }));
                          handleSuggestionFeedback('symptoms', 'positive', suggestions.symptoms || []);
                        }}
                        startIcon={<CheckCircle />}
                      >
                        Aceptar
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => handleSuggestionFeedback('symptoms', 'negative', suggestions.symptoms || [])}
                        aria-label="Rechazar sugerencia"
                      >
                        <Cancel />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleSuggestionFeedback('symptoms', 'ignored', suggestions.symptoms || [])}
                        aria-label="Ignorar sugerencia"
                      >
                        <VisibilityOff />
                      </IconButton>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sección: Diagnóstico */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-slate-800">Diagnóstico</h3>
          <div className="bg-white rounded-2xl shadow-md p-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Diagnóstico Clínico
            </label>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={formData.diagnosis}
              onChange={handleChange('diagnosis')}
              variant="outlined"
              className="bg-slate-50"
            />
            {suggestions?.diagnosis && (
              <div className="mt-2 p-3 border-l-4 border-blue-400 bg-blue-50 rounded-r-lg animate-fade-in">
                <div className="flex items-start gap-2">
                  <span className="text-xl">🤖</span>
                  <div className="flex-1">
                    <p className="text-sm text-slate-700">{suggestions.diagnosis}</p>
                    <div className="mt-2 flex gap-2">
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            diagnosis: suggestions.diagnosis || '',
                          }));
                          handleSuggestionFeedback('diagnosis', 'positive', suggestions.diagnosis || '');
                        }}
                        startIcon={<CheckCircle />}
                      >
                        Aceptar
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => handleSuggestionFeedback('diagnosis', 'negative', suggestions.diagnosis || '')}
                        aria-label="Rechazar sugerencia"
                      >
                        <Cancel />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleSuggestionFeedback('diagnosis', 'ignored', suggestions.diagnosis || '')}
                        aria-label="Ignorar sugerencia"
                      >
                        <VisibilityOff />
                      </IconButton>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sección: Plan de Tratamiento */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-slate-800">Plan de Tratamiento</h3>
          <div className="bg-white rounded-2xl shadow-md p-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tratamiento Prescrito
            </label>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={formData.treatmentPlan}
              onChange={handleChange('treatmentPlan')}
              variant="outlined"
              className="bg-slate-50"
            />
            {suggestions?.treatmentPlan && (
              <div className="mt-2 p-3 border-l-4 border-blue-400 bg-blue-50 rounded-r-lg animate-fade-in">
                <div className="flex items-start gap-2">
                  <span className="text-xl">🤖</span>
                  <div className="flex-1">
                    <p className="text-sm text-slate-700">{suggestions.treatmentPlan}</p>
                    <div className="mt-2 flex gap-2">
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            treatmentPlan: suggestions.treatmentPlan || '',
                          }));
                          handleSuggestionFeedback('treatmentPlan', 'positive', suggestions.treatmentPlan || '');
                        }}
                        startIcon={<CheckCircle />}
                      >
                        Aceptar
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => handleSuggestionFeedback('treatmentPlan', 'negative', suggestions.treatmentPlan || '')}
                        aria-label="Rechazar sugerencia"
                      >
                        <Cancel />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleSuggestionFeedback('treatmentPlan', 'ignored', suggestions.treatmentPlan || '')}
                        aria-label="Ignorar sugerencia"
                      >
                        <VisibilityOff />
                      </IconButton>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sección: Pronóstico y Seguimiento */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-slate-800">Pronóstico y Seguimiento</h3>
          <div className="bg-white rounded-2xl shadow-md p-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Pronóstico
            </label>
            <TextField
              fullWidth
              multiline
              rows={2}
              value={formData.prognosis}
              onChange={handleChange('prognosis')}
              variant="outlined"
              className="bg-slate-50 mb-4"
            />
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Plan de Seguimiento
            </label>
            <TextField
              fullWidth
              multiline
              rows={2}
              value={formData.followUp}
              onChange={handleChange('followUp')}
              variant="outlined"
              className="bg-slate-50"
            />
          </div>
        </div>

        {/* Sección: Frases Clínicas Validadas por Voz */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-slate-800">Frases Clínicas Validadas por Voz</h3>
          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-blue-400">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🎙️</span>
              <span className="text-sm font-medium text-slate-700">Vía escucha activa</span>
            </div>
            {(formData.voiceApprovedNotes || []).length > 0 ? (
              <div className="space-y-2">
                {(formData.voiceApprovedNotes || []).map((note, index) => (
                  <div
                    key={index}
                    className="p-3 bg-slate-50 rounded-lg text-sm text-slate-700"
                  >
                    {note}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">
                No hay frases validadas por voz
              </p>
            )}
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setShowActiveListening(!showActiveListening)}
              className="mt-4"
              aria-label="Alternar panel de escucha activa"
            >
              {showActiveListening ? 'Ocultar Panel' : 'Mostrar Panel de Escucha Activa'}
            </Button>
          </div>
        </div>
      </div>

      {/* Panel de Escucha Activa */}
      <Collapse in={showActiveListening} className="mt-8">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <ActiveListeningPanel
            onPhrasesValidated={handlePhrasesValidated}
          />
        </div>
      </Collapse>

      {/* Botón de Envío */}
      <div className="mt-8 flex justify-end">
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          className="px-8"
          disabled={isLoading}
        >
          {isLoading ? 'Analizando...' : 'Guardar Ficha Clínica'}
        </Button>
      </div>
    </form>
  );
}; 