import { useRef  } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import AuditLogClient from '@/core/clients/AuditLogClient';
import { useAuth } from '@/core/context/AuthContext';
import type { PatientEval  } from '@/modules/emr/types/Evaluation';

interface StructuredVisitFormProps {
  formData: PatientEval;
  setFormData: React.Dispatch<React.SetStateAction<PatientEval>>;
  onSubmit: (data: PatientEval) => void;
}

function debounceFieldChange(
  fn: (field: keyof PatientEval, oldValue: string, newValue: string) => void,
  delay: number
) {
  let timer: NodeJS.Timeout;
  return (field: keyof PatientEval, oldValue: string, newValue: string) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(field, oldValue, newValue), delay);
  };
}

const StructuredVisitForm: React.FC<StructuredVisitFormProps> = ({ formData, setFormData, onSubmit }) => {
  const { user } = useAuth();
  const lastValues = useRef<Partial<PatientEval>>({ ...formData });
  const debounceRefs = useRef<Record<string, (field: keyof PatientEval, oldValue: string, newValue: string) => void>>({});

  const logFieldChange = (field: keyof PatientEval, oldValue: string, newValue: string) => {
    if (!formData.patientId || !user?.email) return;
    
    // Log simplificado para depuración
    console.log(`Field changed: ${field}`, { 
      oldValue, 
      newValue, 
      userId: user?.id || 'anonymous', 
      visitId: formData.patientId 
    });
    
    // Simulación de registro de cambio de campo
    try {
      console.log('[AuditLog] Field update:', {
        field,
        oldValue,
        newValue,
        visitId: formData.patientId,
        modifiedBy: user.email,
      });
    } catch (error) {
      console.error('Error logging field change:', error);
    }
  };

  const handleFieldChange = (field: keyof PatientEval) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => {
      const oldValue = prev[field] || '';
      // Solo loguear si el valor realmente cambió
      if (oldValue !== value) {
        if (!debounceRefs.current[field]) {
          debounceRefs.current[field] = debounceFieldChange(logFieldChange, 1000);
        }
        debounceRefs.current[field](field, oldValue, value);
      }
      lastValues.current[field] = value;
      return { ...prev, [field]: value };
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
        onChange={handleFieldChange('motivo')}
        required
      />

      <TextField
        label="Diagnóstico Fisioterapéutico"
        value={formData.diagnosticoFisioterapeutico || ''}
        onChange={handleFieldChange('diagnosticoFisioterapeutico')}
        required
      />

      <TextField
        label="Tratamiento Propuesto"
        value={formData.tratamientoPropuesto || ''}
        onChange={handleFieldChange('tratamientoPropuesto')}
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