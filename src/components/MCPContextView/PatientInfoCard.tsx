import React from 'react';
import { Paper, Typography, Divider, Grid, Chip } from '@mui/material';
import { MCPContext } from '../../core/mcp/CopilotContextBuilder';

interface PatientInfoCardProps {
  patientState: MCPContext['patient_state'];
  enrichment?: MCPContext['enrichment'];
}

export const PatientInfoCard: React.FC<PatientInfoCardProps> = ({ patientState, enrichment }) => {
  const emrData = enrichment?.emr?.patient_data;

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Información del Paciente
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={2}>
        {/* Nombre del paciente */}
        {emrData?.name && (
          <Grid item xs={12}>
            <Typography variant="subtitle1" color="primary">
              {emrData.name}
            </Typography>
          </Grid>
        )}

        {/* Datos básicos */}
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            Edad
          </Typography>
          <Typography variant="body1">
            {patientState.age} años
          </Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            Sexo
          </Typography>
          <Typography variant="body1">
            {patientState.sex === 'M' ? 'Masculino' :
             patientState.sex === 'F' ? 'Femenino' :
             'Otro'}
          </Typography>
        </Grid>

        {/* Alergias */}
        {emrData?.allergies && emrData.allergies.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Alergias
            </Typography>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {emrData.allergies.map((allergy, index) => (
                <Chip
                  key={index}
                  label={allergy}
                  color="error"
                  size="small"
                  variant="outlined"
                />
              ))}
            </div>
          </Grid>
        )}

        {/* Condiciones Crónicas */}
        {emrData?.chronicConditions && emrData.chronicConditions.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Condiciones Crónicas
            </Typography>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {emrData.chronicConditions.map((condition, index) => (
                <Chip
                  key={index}
                  label={condition}
                  color="primary"
                  size="small"
                  variant="outlined"
                />
              ))}
            </div>
          </Grid>
        )}

        {/* Medicamentos Actuales */}
        {emrData?.medications && emrData.medications.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Medicamentos Actuales
            </Typography>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {emrData.medications.map((medication, index) => (
                <Chip
                  key={index}
                  label={medication}
                  color="info"
                  size="small"
                  variant="outlined"
                />
              ))}
            </div>
          </Grid>
        )}

        {/* Historia Clínica */}
        {patientState.history.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Historia Clínica Relevante
            </Typography>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {patientState.history.map((item, index) => (
                <Chip
                  key={index}
                  label={item}
                  color="default"
                  size="small"
                  variant="outlined"
                />
              ))}
            </div>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
}; 