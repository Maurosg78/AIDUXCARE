import React from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { trackEvent } from '@/core/services/langfuseClient';
import { PatientEval } from '@/modules/emr/types/Evaluation';

interface StructuredVisitFormProps {
  formData: PatientEval;
  setFormData: React.Dispatch<React.SetStateAction<PatientEval>>;
  onSubmit: (data: PatientEval) => void;
}

const StructuredVisitForm: React.FC<StructuredVisitFormProps> = ({ formData, setFormData, onSubmit }) => {
  const handleChange = (field: keyof PatientEval) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    const payload = { patientId: updated.patientId, [field]: value };
    console.log('[Langfuse] Enviando form.update, payload:', payload, 'traceId:', updated.traceId);
    trackEvent({
      name: 'form.update',
      payload,
      traceId: updated.traceId!
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Box
      component="form"
      onSubmit={handleFormSubmit}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}
    >
      <Typography variant="h6">Nueva Visita Estructurada</Typography>

      <TextField
        label="Anamnesis"
        value={formData.anamnesis || ''}
        onChange={handleChange('anamnesis')}
        required
      />
      <TextField
        label="Exploración Física"
        value={formData.exam || ''}
        onChange={handleChange('exam')}
        required
      />
      <TextField
        label="Diagnóstico"
        value={formData.diagnosis || ''}
        onChange={handleChange('diagnosis')}
        required
      />
      <TextField
        label="Plan de Tratamiento"
        value={formData.plan || ''}
        onChange={handleChange('plan')}
        required
      />
      <TextField
        label="Notas Adicionales"
        value={formData.notes || ''}
        onChange={handleChange('notes')}
        multiline
        rows={4}
      />

      <Button type="submit" variant="contained">
        Guardar Visita
      </Button>
    </Box>
  );
};

export default StructuredVisitForm;

