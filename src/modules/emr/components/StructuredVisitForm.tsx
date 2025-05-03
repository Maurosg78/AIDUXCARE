import React, { useState, useCallback } from 'react';
import { TextField, Button, IconButton, Collapse, Box, FormControl, InputLabel } from '@mui/material';
import { trackEvent } from '@/core/services/langfuseClient';
import { PatientEval } from '@/types/Evaluation';
import { useCopilot } from '@/modules/assistant/hooks/useCopilot';
import { ActiveListeningPanel } from '@/modules/assistant/components/ActiveListeningPanel';
import { CheckCircle, Cancel, VisibilityOff } from '@mui/icons-material';
import { ValidationErrors } from '../types';
import PatientService from '../services/PatientService';
import { styles } from './StructuredVisitForm.styles';

interface StructuredVisitFormProps {
  patientId: string;
  onSubmit?: (data: PatientEval) => void;
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
      lastUpdated: new Date().toISOString(),
    },
    voiceApprovedNotes: [],
    ...initialData,
  });

  const [_voiceNotes, setVoiceNotes] = useState<string[]>([]);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showActiveListening, setShowActiveListening] = useState(false);

  const handleSuggestionAccepted = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const { suggestions, isAnalyzing, analyzeVoiceNotes, acceptSuggestion, rejectSuggestion } = 
    useCopilot({ 
      patientEval: formData,
      onSuggestionAccepted: handleSuggestionAccepted 
    });

  const handleChange = (field: keyof PatientEval) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newValue = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: field === 'symptoms' ? newValue.split(',').map(s => s.trim()) : newValue,
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

    if (errors[field]) {
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
      const visitData = {
        ...formData,
        symptoms: formData.symptoms.join(', ')
      };
      await PatientService.saveVisitData(patientId, visitData);
      setSuccessMessage('Visita guardada exitosamente');
      onSubmit?.(formData);
      setFormData({
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
          lastUpdated: new Date().toISOString(),
        },
        voiceApprovedNotes: [],
      });
      setVoiceNotes([]);
    } catch (error) {
      console.error('Error al guardar la visita:', error);
      setErrors(prev => ({ ...prev, general: 'Error al guardar la visita' }));
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
    <Box component="form" onSubmit={handleSubmit} sx={styles.form}>
      {successMessage && <Box sx={styles.success}>{successMessage}</Box>}

      <FormControl sx={styles.field}>
        <InputLabel htmlFor="chiefComplaint">Motivo de Consulta</InputLabel>
        <TextField
          id="chiefComplaint"
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
        {errors.chiefComplaint && (
          <Box sx={styles.error} data-testid="error-chief-complaint">
            {errors.chiefComplaint}
          </Box>
        )}
      </FormControl>

      <FormControl sx={styles.field}>
        <InputLabel htmlFor="symptoms">Síntomas</InputLabel>
        <TextField
          id="symptoms"
          fullWidth
          multiline
          rows={4}
          value={formData.symptoms.join(', ')}
          onChange={handleChange('symptoms')}
          variant="outlined"
          className="bg-slate-50"
          placeholder="Describa los síntomas del paciente"
          data-testid="symptoms"
        />
        {errors.symptoms && (
          <Box sx={styles.error} data-testid="error-symptoms">
            {errors.symptoms}
          </Box>
        )}
      </FormControl>

      <FormControl sx={styles.field}>
        <InputLabel htmlFor="diagnosis">Diagnóstico</InputLabel>
        <TextField
          id="diagnosis"
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
        {errors.diagnosis && (
          <Box sx={styles.error}>
            {errors.diagnosis}
          </Box>
        )}
      </FormControl>

      <FormControl sx={styles.field}>
        <InputLabel htmlFor="treatmentPlan">Plan de Tratamiento</InputLabel>
        <TextField
          id="treatmentPlan"
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
        {errors.treatmentPlan && (
          <Box sx={styles.error}>
            {errors.treatmentPlan}
          </Box>
        )}
      </FormControl>

      <FormControl sx={styles.field}>
        <InputLabel htmlFor="followUp">Recomendaciones / Seguimiento</InputLabel>
        <TextField
          id="followUp"
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
      </FormControl>

      <FormControl sx={styles.field}>
        <InputLabel htmlFor="prognosis">Pronóstico</InputLabel>
        <TextField
          id="prognosis"
          fullWidth
          multiline
          rows={2}
          value={formData.prognosis}
          onChange={handleChange('prognosis')}
          variant="outlined"
          className="bg-slate-50"
        />
      </FormControl>

      <Box sx={styles.voiceNotes}>
        <Box sx={styles.voiceNotesTitle}>Frases Clínicas Validadas por Voz</Box>
        <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-blue-400">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🎙️</span>
            <span className="text-sm font-medium text-slate-700">Vía escucha activa</span>
          </div>
          {(formData.voiceApprovedNotes || []).length > 0 ? (
            <div className="space-y-2">
              {(formData.voiceApprovedNotes || []).map((note, index) => (
                <div
                  key={`voice-note-${index}`}
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
      </Box>

      <Box sx={styles.field}>
        <Box sx={styles.voiceNotesTitle}>Sugerencias</Box>
        <div className="bg-white rounded-2xl shadow-md p-6">
          {suggestions && (
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div
                  key={`suggestion-${index}`}
                  className="flex items-start gap-2"
                >
                  <span className="text-sm text-slate-700">{suggestion.text}</span>
                  <div className="flex gap-2">
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={() => acceptSuggestion(suggestion)}
                      startIcon={<CheckCircle />}
                    >
                      Aceptar
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => rejectSuggestion(suggestion)}
                      aria-label="Rechazar sugerencia"
                    >
                      <Cancel />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => acceptSuggestion(suggestion)}
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
      </Box>

      <Collapse in={showActiveListening} className="mt-8">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <ActiveListeningPanel
            onPhrasesValidated={handlePhrasesValidated}
          />
        </div>
      </Collapse>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        size="large"
        sx={styles.button}
        disabled={isLoading || isAnalyzing}
        data-testid="save-visit"
      >
        {isLoading ? 'Guardando...' : 'Guardar Visita'}
      </Button>
    </Box>
  );
}; 