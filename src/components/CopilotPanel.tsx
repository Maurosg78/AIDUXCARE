import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { trackEvent } from '@/core/services/langfuseClient';
import { PatientEval } from '@/modules/emr/types/Evaluation';
import debounce from 'lodash/debounce';

interface StructuredVisitFormProps {
  formData: PatientEval;
  setFormData: React.Dispatch<React.SetStateAction<PatientEval>>;
  onSubmit: (data: PatientEval) => void;
}

const StructuredVisitForm: React.FC<StructuredVisitFormProps> = ({ formData, setFormData, onSubmit }) => {
  const [localFormData, setLocalFormData] = useState<PatientEval>(formData);

  // Debounce para trackEvent
  const debouncedTrackEvent = useCallback(
    debounce((updated: PatientEval) => {
      const changedFields = Object.keys(updated).filter(key => updated[key as keyof PatientEval] !== formData[key as keyof PatientEval]);
      const payload = {
        patientId: updated.patientId,
        changedFields,
        updatedData: updated
      };
      console.log('[Langfuse] Enviando form.update, payload:', payload, 'traceId:', updated.traceId);
      trackEvent('form.update', payload, updated.traceId!);
    }, 1000),
    [formData]
  );

  // Actualizar formData local y disparar evento
  const handleChange = (field: keyof PatientEval) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const updated = { ...localFormData, [field]: value };
    setLocalFormData(updated);
    setFormData(updated);

    const changedFields = [field];
    const payload = {
      patientId: updated.patientId,
      changedFields,
      updatedData: updated
    };
    console.log('[Langfuse] Enviando form.update, payload:', payload, 'traceId:', updated.traceId);
    trackEvent('form.update', payload, updated.traceId!);
  };

  // Sincronizar formData local con props
  useEffect(() => {
    setLocalFormData(formData);
  }, [formData]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(localFormData);
  };

  return (
    <Box component="form" onSubmit={handleFormSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
      <Typography variant="h6">Nueva Visita Estructurada</Typography>
      <TextField
        label="Anamnesis"
        value={localFormData.anamnesis || ''}
        onChange={handleChange('anamnesis')}
        required
      />
      <TextField
        label="Exploración Física"
        value={localFormData.exam || ''}
        onChange={handleChange('exam')}
        required
      />
      <TextField
        label="Diagnóstico"
        value={localFormData.diagnosis || ''}
        onChange={handleChange('diagnosis')}
        required
      />
      <TextField
        label="Plan de Tratamiento"
        value={localFormData.plan || ''}
        onChange={handleChange('plan')}
        required
      />
      <TextField
        label="Notas Adicionales"
        value={localFormData.notes || ''}
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
