import React from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { trackEvent } from '@/core/lib/langfuse.client';
import { PatientEval } from '@/modules/emr/types/Evaluation';

interface StructuredVisitFormProps {
  formData: PatientEval;
  setFormData: React.Dispatch<React.SetStateAction<PatientEval>>;
  onSubmit: (data: PatientEval) => void;
}

const StructuredVisitForm: React.FC<StructuredVisitFormProps> = ({ formData, setFormData, onSubmit }) => {
  const handleFieldChange = (field: keyof PatientEval) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    trackEvent({
      name: "form.update",
      payload: { 
        patientId: updated.patientId,
        field,
        value,
        timestamp: new Date().toISOString()
      },
      traceId: updated.traceId
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
        label="Motivo de Consulta"
        value={formData.motivo || ''}
        onChange={(e) => {
          const value = e.target.value;
          setFormData(prev => ({ ...prev, motivo: value }));
          
          trackEvent({
            name: "form.update",
            payload: { 
              patientId: "nuria-arnedo",
              field: "motivoConsulta",
              value: value,
              timestamp: new Date().toISOString()
            },
            traceId: "nuria-arnedo"
          });
        }}
        required
      />

      <TextField
        label="Diagnóstico Fisioterapéutico"
        value={formData.diagnosticoFisioterapeutico || ''}
        onChange={(e) => {
          const value = e.target.value;
          setFormData(prev => ({ ...prev, diagnosticoFisioterapeutico: value }));
          
          trackEvent({
            name: "form.update",
            payload: { 
              patientId: "nuria-arnedo",
              field: "diagnosticoFisioterapeutico",
              value: value,
              timestamp: new Date().toISOString()
            },
            traceId: "nuria-arnedo"
          });
        }}
        required
      />

      <TextField
        label="Tratamiento Propuesto"
        value={formData.tratamientoPropuesto || ''}
        onChange={(e) => {
          const value = e.target.value;
          setFormData(prev => ({ ...prev, tratamientoPropuesto: value }));
          
          trackEvent({
            name: "form.update",
            payload: { 
              patientId: "nuria-arnedo",
              field: "tratamientoPropuesto",
              value: value,
              timestamp: new Date().toISOString()
            },
            traceId: "nuria-arnedo"
          });
        }}
        required
      />

      <TextField
        label="Anamnesis"
        value={formData.anamnesis || ''}
        onChange={handleFieldChange('anamnesis')}
        required
      />
      <TextField
        label="Exploración Física"
        value={formData.exam || ''}
        onChange={handleFieldChange('exam')}
        required
      />
      <TextField
        label="Diagnóstico"
        value={formData.diagnosis || ''}
        onChange={handleFieldChange('diagnosis')}
        required
      />
      <TextField
        label="Plan de Tratamiento"
        value={formData.plan || ''}
        onChange={handleFieldChange('plan')}
        required
      />
      <TextField
        label="Notas Adicionales"
        value={formData.notes || ''}
        onChange={handleFieldChange('notes')}
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

