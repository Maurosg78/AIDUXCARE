import React, { useState, useCallback } from 'react';
import { TextField, Button, IconButton, Collapse } from '@mui/material';
import { trackEvent } from '@/core/services/langfuseClient';
import { PatientEval } from '@/types/Evaluation';
import { useCopilot } from '@/modules/assistant/hooks/useCopilot';
import { ActiveListeningPanel } from '@/modules/assistant/components/ActiveListeningPanel';
import { CheckCircle, Cancel, VisibilityOff } from '@mui/icons-material';
import { VisitData, ValidationErrors } from '../types';
import PatientService from '../services/PatientService';

interface StructuredVisitFormProps {
  patientId: string;
  onSubmit: (data: PatientEval) => void;
  initialData?: Partial<PatientEval>;
}

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px'
  },
  field: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px'
  },
  label: {
    fontWeight: 'bold' as const,
    color: '#333'
  },
  input: {
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px'
  },
  textarea: {
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    minHeight: '100px',
    fontSize: '16px',
    fontFamily: 'inherit'
  },
  error: {
    color: '#dc3545',
    fontSize: '14px'
  },
  button: {
    padding: '12px 24px',
    backgroundColor: '#0066cc',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '20px'
  },
  success: {
    backgroundColor: '#198754',
    color: 'white',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '20px'
  },
  suggestion: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#e3f2fd',
    borderRadius: '4px',
    borderLeft: '4px solid #0066cc'
  },
  suggestionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px'
  },
  suggestionText: {
    fontSize: '14px',
    color: '#333',
    marginBottom: '8px'
  },
  suggestionButton: {
    padding: '4px 8px',
    backgroundColor: '#0066cc',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  voiceNotes: {
    marginTop: '20px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  voiceNotesTitle: {
    fontSize: '16px',
    color: '#333',
    marginBottom: '10px'
  },
  voiceNotesList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px'
  },
  voiceNote: {
    padding: '8px',
    backgroundColor: 'white',
    borderRadius: '4px',
    fontSize: '14px',
    color: '#333'
  }
};

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
    symptoms: '',
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

  const [voiceNotes, setVoiceNotes] = useState<string[]>([]);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showActiveListening, setShowActiveListening] = useState(false);

  const handleSuggestionAccepted = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const { suggestions, isAnalyzing, analyzeVoiceNotes, acceptSuggestion, rejectSuggestion } = 
    useCopilot({ onSuggestionAccepted: handleSuggestionAccepted });

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

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePhrasesValidated = async (phrases: string[]) => {
    setVoiceNotes(prev => [...prev, ...phrases]);
    await analyzeVoiceNotes(phrases);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await PatientService.saveVisitData(patientId, formData);
      setSuccessMessage('Visita guardada exitosamente');
      setFormData({
        id: '',
        patientId,
        visitDate: new Date().toISOString(),
        chiefComplaint: '',
        symptoms: '',
        diagnosis: '',
        treatmentPlan: '',
        prognosis: '',
        followUp: '',
        metadata: {
          traceId: '',
          lastUpdated: new Date().toISOString(),
        },
        voiceApprovedNotes: [],
      });
      setVoiceNotes([]);
    } catch (error) {
      setErrors({ ...errors, submit: 'Error al guardar la visita' });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.chiefComplaint.trim()) {
      newErrors.chiefComplaint = 'El motivo de consulta es obligatorio';
    }
    if (!formData.symptoms.length) {
      newErrors.symptoms = 'Los síntomas son obligatorios';
    }
    if (!formData.diagnosis.trim()) {
      newErrors.diagnosis = 'El diagnóstico es obligatorio';
    }
    if (!formData.treatmentPlan.trim()) {
      newErrors.treatmentPlan = 'El plan de tratamiento es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <form style={styles.form} onSubmit={handleSubmit}>
      {successMessage && <div style={styles.success}>{successMessage}</div>}

      <div style={styles.field}>
        <label style={styles.label}>Motivo de Consulta</label>
        <TextField
          fullWidth
          multiline
          rows={3}
          value={formData.chiefComplaint}
          onChange={handleChange('chiefComplaint')}
          variant="outlined"
          className="bg-slate-50"
          placeholder="Describa el motivo principal de la consulta"
          data-testid="chief-complaint"
        />
        {errors.chiefComplaint && <span style={styles.error} data-testid="error-chief-complaint">{errors.chiefComplaint}</span>}
        {suggestions?.map(suggestion => 
          suggestion.field === 'chiefComplaint' && (
            <div key={suggestion.text} style={styles.suggestion}>
              <div style={styles.suggestionHeader}>
                <span>🤖</span>
                <span>Sugerencia del Copiloto</span>
              </div>
              <p style={styles.suggestionText}>{suggestion.text}</p>
              <div>
                <button
                  type="button"
                  style={styles.suggestionButton}
                  onClick={() => acceptSuggestion(suggestion)}
                >
                  Aceptar Sugerencia
                </button>
              </div>
            </div>
          )
        )}
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Síntomas</label>
        <TextField
          fullWidth
          multiline
          rows={4}
          value={formData.symptoms?.join(', ') || ''}
          onChange={handleChange('symptoms')}
          variant="outlined"
          className="bg-slate-50"
          placeholder="Describa los síntomas del paciente"
          data-testid="symptoms"
        />
        {errors.symptoms && <span style={styles.error} data-testid="error-symptoms">{errors.symptoms}</span>}
        {suggestions?.map(suggestion => 
          suggestion.field === 'symptoms' && (
            <div key={suggestion.text} style={styles.suggestion}>
              <div style={styles.suggestionHeader}>
                <span>🤖</span>
                <span>Sugerencia del Copiloto</span>
              </div>
              <p style={styles.suggestionText}>{suggestion.text}</p>
              <div>
                <button
                  type="button"
                  style={styles.suggestionButton}
                  onClick={() => acceptSuggestion(suggestion)}
                >
                  Aceptar Sugerencia
                </button>
              </div>
            </div>
          )
        )}
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Diagnóstico</label>
        <TextField
          fullWidth
          multiline
          rows={3}
          value={formData.diagnosis}
          onChange={handleChange('diagnosis')}
          variant="outlined"
          className="bg-slate-50"
          placeholder="Ingrese el diagnóstico"
          data-testid="diagnosis"
        />
        {errors.diagnosis && <span style={styles.error}>{errors.diagnosis}</span>}
        {suggestions?.map(suggestion => 
          suggestion.field === 'diagnosis' && (
            <div key={suggestion.text} style={styles.suggestion}>
              <div style={styles.suggestionHeader}>
                <span>🤖</span>
                <span>Sugerencia del Copiloto</span>
              </div>
              <p style={styles.suggestionText}>{suggestion.text}</p>
              <div>
                <button
                  type="button"
                  style={styles.suggestionButton}
                  onClick={() => acceptSuggestion(suggestion)}
                >
                  Aceptar Sugerencia
                </button>
              </div>
            </div>
          )
        )}
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Plan de Tratamiento</label>
        <TextField
          fullWidth
          multiline
          rows={4}
          value={formData.treatmentPlan}
          onChange={handleChange('treatmentPlan')}
          variant="outlined"
          className="bg-slate-50"
          placeholder="Describa el plan de tratamiento"
          data-testid="treatment-plan"
        />
        {errors.treatmentPlan && <span style={styles.error}>{errors.treatmentPlan}</span>}
        {suggestions?.map(suggestion => 
          suggestion.field === 'treatmentPlan' && (
            <div key={suggestion.text} style={styles.suggestion}>
              <div style={styles.suggestionHeader}>
                <span>🤖</span>
                <span>Sugerencia del Copiloto</span>
              </div>
              <p style={styles.suggestionText}>{suggestion.text}</p>
              <div>
                <button
                  type="button"
                  style={styles.suggestionButton}
                  onClick={() => acceptSuggestion(suggestion)}
                >
                  Aceptar Sugerencia
                </button>
              </div>
            </div>
          )
        )}
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Recomendaciones / Seguimiento</label>
        <TextField
          fullWidth
          multiline
          rows={2}
          value={formData.followUp}
          onChange={handleChange('followUp')}
          variant="outlined"
          className="bg-slate-50"
          placeholder="Ingrese las recomendaciones y plan de seguimiento"
          data-testid="follow-up"
        />
        {errors.followUp && <span style={styles.error}>{errors.followUp}</span>}
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Pronóstico</label>
        <TextField
          fullWidth
          multiline
          rows={2}
          value={formData.prognosis}
          onChange={handleChange('prognosis')}
          variant="outlined"
          className="bg-slate-50"
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Frases Clínicas Validadas por Voz</label>
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

      <div style={styles.field}>
        <label style={styles.label}>Sugerencias</label>
        <div className="bg-white rounded-2xl shadow-md p-6">
          {suggestions && (
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2"
                >
                  <span className="text-sm text-slate-700">{suggestion.text}</span>
                  <div className="flex gap-2">
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          [suggestion.field as keyof PatientEval]: suggestion.text,
                        }));
                        acceptSuggestion(suggestion.text);
                      }}
                      startIcon={<CheckCircle />}
                    >
                      Aceptar
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => rejectSuggestion(suggestion.text)}
                      aria-label="Rechazar sugerencia"
                    >
                      <Cancel />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => acceptSuggestion(suggestion.text)}
                      aria-label="Ignorar sugerencia"
                    >
                      <VisibilityOff />
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Errores</label>
        <div className="bg-white rounded-2xl shadow-md p-6">
          {Object.entries(errors).map(([field, error]) => (
            <div
              key={field}
              className="flex items-start gap-2"
            >
              <span className="text-sm text-slate-700">{field}:</span>
              <span style={styles.error}>{error}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Carga</label>
        <div className="bg-white rounded-2xl shadow-md p-6">
          {isLoading && <p>Guardando...</p>}
        </div>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Panel de Escucha Activa</label>
        <div className="bg-white rounded-2xl shadow-md p-6">
          <Collapse in={showActiveListening} className="mt-8">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <ActiveListeningPanel
                onPhrasesValidated={handlePhrasesValidated}
              />
            </div>
          </Collapse>
        </div>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Botón de Envío</label>
        <div style={styles.field}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            style={styles.button}
            disabled={isLoading || isAnalyzing}
            data-testid="save-visit"
          >
            {isLoading ? 'Guardando...' : 'Guardar Visita'}
          </Button>
        </div>
      </div>
    </form>
  );
}; 