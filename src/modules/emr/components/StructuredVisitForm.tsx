import * as React from 'react';
import { TextField, Button, Box, Typography, Grid, Paper, CircularProgress } from '@mui/material';
import type { ChangeEvent, FormEvent } from 'react';

// Definición local de interfaces para el componente
interface ClinicalEvaluationData {
  id?: string;
  patientId?: string;
  visitId?: string;
  date?: string;
  status?: string;
  sections?: Record<string, unknown>;
  anamnesis?: string;
  exam?: string;
  diagnosis?: string;
  plan?: string;
  voiceApprovedNotes?: string[];
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

interface CopilotSuggestion {
  id: string;
  message: string;
  icon: string;
  type: 'info' | 'warning' | 'success';
}

interface StructuredVisitFormProps {
  visitId: string;
  onSave: (data: ClinicalEvaluationData) => Promise<void>;
  onCancel: () => void;
  initialData?: ClinicalEvaluationData;
  copilotSuggestions?: CopilotSuggestion[];
  onAcceptSuggestion?: (suggestion: CopilotSuggestion) => void;
  onRejectSuggestion?: (suggestion: CopilotSuggestion) => void;
}

export const StructuredVisitForm = ({
  visitId: _visitId, // Renombramos para indicar que no se usa
  onSave,
  onCancel,
  initialData,
}: StructuredVisitFormProps) => {
  const [formData, setFormData] = React.useState<ClinicalEvaluationData>(initialData ?? {});
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: ClinicalEvaluationData) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSave(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la evaluación');
    } finally {
      setLoading(false);
    }
  };

  return React.createElement(Paper, { sx: { p: 3 } },
    React.createElement('form', { onSubmit: handleSubmit },
      React.createElement(Grid, { container: true, spacing: 3 }, [
        // Título
        React.createElement(Grid, { item: true, xs: 12, key: 'title' },
          React.createElement(Typography, { variant: 'h6', gutterBottom: true }, 'Evaluación Clínica')
        ),
        
        // Campo Anamnesis
        React.createElement(Grid, { item: true, xs: 12, key: 'anamnesis' },
          React.createElement(TextField, {
            fullWidth: true,
            multiline: true,
            rows: 4,
            label: 'Anamnesis',
            name: 'anamnesis',
            value: formData.anamnesis ?? '',
            onChange: handleChange
          })
        ),
        
        // Campo Examen Físico
        React.createElement(Grid, { item: true, xs: 12, key: 'exam' },
          React.createElement(TextField, {
            fullWidth: true,
            multiline: true,
            rows: 4,
            label: 'Examen Físico',
            name: 'exam',
            value: formData.exam ?? '',
            onChange: handleChange
          })
        ),
        
        // Campo Diagnóstico
        React.createElement(Grid, { item: true, xs: 12, key: 'diagnosis' },
          React.createElement(TextField, {
            fullWidth: true,
            multiline: true,
            rows: 4,
            label: 'Diagnóstico',
            name: 'diagnosis',
            value: formData.diagnosis ?? '',
            onChange: handleChange
          })
        ),
        
        // Campo Plan de Tratamiento
        React.createElement(Grid, { item: true, xs: 12, key: 'plan' },
          React.createElement(TextField, {
            fullWidth: true,
            multiline: true,
            rows: 4,
            label: 'Plan de Tratamiento',
            name: 'plan',
            value: formData.plan ?? '',
            onChange: handleChange
          })
        ),
        
        // Mensaje de error (si existe)
        error && React.createElement(Grid, { item: true, xs: 12, key: 'error' },
          React.createElement(Typography, { color: 'error' }, error)
        ),
        
        // Botones
        React.createElement(Grid, { item: true, xs: 12, key: 'buttons' },
          React.createElement(Box, { sx: { display: 'flex', gap: 2, justifyContent: 'flex-end' } }, [
            React.createElement(Button, {
              key: 'cancel',
              variant: 'outlined',
              onClick: onCancel,
              disabled: loading
            }, 'Cancelar'),
            
            React.createElement(Button, {
              key: 'submit',
              type: 'submit',
              variant: 'contained',
              disabled: loading
            }, loading ? React.createElement(CircularProgress, { size: 24 }) : 'Guardar')
          ])
        )
      ])
    )
  );
}; 