import React, { useEffect, useState } from 'react';
import { Box, Typography, LinearProgress, Grid, Paper, Tooltip } from '@mui/material';
import { PatientVisit, PatientEval } from '@/core/types';

interface VisitQualityPanelProps {
  visit: PatientVisit;
  evalData?: PatientEval;
}

export default function VisitQualityPanel({ visit, evalData }: VisitQualityPanelProps) {
  const [completeness, setCompleteness] = useState<number>(0);
  const [metrics, setMetrics] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Calcular métricas de completitud
    const calculatedMetrics = {
      // Usar evalData si está disponible, o las propiedades de visit como fallback
      motivoConsulta: !!(evalData?.anamnesis?.trim() || evalData?.motivo?.trim()),
      diagnosticoFisioterapeutico: !!(evalData?.diagnosis?.trim() || evalData?.diagnosticoFisioterapeutico?.trim()),
      tratamientoPropuesto: !!(evalData?.treatment?.trim() || evalData?.tratamientoPropuesto?.trim()),
      
      // Campos obligatorios
      tieneVisitDate: !!visit.visitDate?.trim(),
      tieneVisitType: !!visit.visitType?.trim(),
      
      // Si hay notas generales
      tieneNotas: !!visit.notes?.trim()
    };
    
    setMetrics(calculatedMetrics);
    
    // Calcular porcentaje de completitud (campos obligatorios)
    const completedFields = Object.values(calculatedMetrics).filter(Boolean).length;
    const totalFields = Object.keys(calculatedMetrics).length;
    setCompleteness(Math.round((completedFields / totalFields) * 100));
  }, [visit, evalData]);

  const getQualityColor = (value: number): string => {
    if (value < 50) return '#f44336'; // Rojo
    if (value < 75) return '#ff9800'; // Naranja
    return '#4caf50'; // Verde
  };

  return (
    <Paper elevation={0} sx={{ p: 2, border: '1px solid rgba(0, 0, 0, 0.12)', borderRadius: 1 }}>
      <Typography variant="subtitle1" gutterBottom>
        Calidad del reporte
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2">Completitud</Typography>
          <Typography variant="body2">{completeness}%</Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={completeness} 
          sx={{ 
            height: 8, 
            borderRadius: 5,
            bgcolor: 'rgba(0, 0, 0, 0.09)',
            '& .MuiLinearProgress-bar': {
              bgcolor: getQualityColor(completeness)
            }
          }}
        />
      </Box>
      
      <Grid container spacing={1}>
        {Object.entries(metrics).map(([key, isComplete]) => (
          <Grid item xs={6} key={key}>
            <Tooltip title={isComplete ? 'Completado' : 'Pendiente'}>
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Box sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: isComplete ? '#4caf50' : '#f5f5f5',
                  border: isComplete ? 'none' : '1px solid #e0e0e0'
                }} />
                <Typography variant="body2" color={isComplete ? 'textPrimary' : 'text.secondary'}>
                  {translateMetricName(key)}
                </Typography>
              </Box>
            </Tooltip>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}

function translateMetricName(key: string): string {
  const translations: Record<string, string> = {
    motivoConsulta: 'Motivo de consulta',
    diagnosticoFisioterapeutico: 'Diagnóstico',
    tratamientoPropuesto: 'Tratamiento',
    tieneVisitDate: 'Fecha registrada',
    tieneVisitType: 'Tipo de visita',
    tieneNotas: 'Notas generales'
  };
  
  return translations[key] || key;
} 