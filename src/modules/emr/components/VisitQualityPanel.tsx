import React, { useMemo } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { PatientVisit } from '@/modules/emr/models/PatientVisit';

interface VisitQualityPanelProps {
  visit: PatientVisit;
}

type CompletionLevel = 'Bajo' | 'Medio' | 'Alto';

export default function VisitQualityPanel({ visit }: VisitQualityPanelProps) {
  // Mock de validación de audio (en producción vendría de la visita)
  const isAudioValidated = useMemo(() => Math.random() > 0.5, []);

  // Mock de eventos Langfuse (en producción usar el cliente real)
  const hasLangfuseEvents = useMemo(() => Math.random() > 0.3, []);

  // Verificar campos completos
  const completedFields = {
    motivoConsulta: !!visit.motivo?.trim(),
    diagnosticoFisioterapeutico: !!visit.diagnosticoFisioterapeutico?.trim(),
    tratamientoPropuesto: !!visit.tratamientoPropuesto?.trim(),
  };

  const completedCount = Object.values(completedFields).filter(Boolean).length;

  // Calcular nivel de completitud
  const completionLevel: CompletionLevel = useMemo(() => {
    if (completedCount <= 1) return 'Bajo';
    if (completedCount === 2) return 'Medio';
    return isAudioValidated ? 'Alto' : 'Medio';
  }, [completedCount, isAudioValidated]);

  // Estilos según nivel
  const levelStyles = {
    Bajo: { color: '#ef4444', icon: '🔴' },
    Medio: { color: '#f59e0b', icon: '🟡' },
    Alto: { color: '#22c55e', icon: '🟢' },
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          📋 Calidad de la Visita
        </Typography>

        {/* Campos Completos */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Campos Completados:
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <Typography component="li">
              {completedFields.motivoConsulta ? '✅' : '❌'} Motivo de Consulta
            </Typography>
            <Typography component="li">
              {completedFields.diagnosticoFisioterapeutico ? '✅' : '❌'} Diagnóstico Fisioterapéutico
            </Typography>
            <Typography component="li">
              {completedFields.tratamientoPropuesto ? '✅' : '❌'} Tratamiento Propuesto
            </Typography>
          </Box>
        </Box>

        {/* Alertas */}
        {completedCount < 3 && (
          <Box sx={{ mb: 2 }}>
            <Typography color="warning.main">
              ⚠️ Faltan {3 - completedCount} campos por completar
            </Typography>
          </Box>
        )}

        {/* Estado de Validación */}
        <Box sx={{ mb: 2 }}>
          <Typography>
            🔒 Validación por Audio: {isAudioValidated ? 'Completada' : 'Pendiente'}
          </Typography>
          <Typography>
            📡 Eventos Registrados: {hasLangfuseEvents ? 'Sí' : 'No'}
          </Typography>
        </Box>

        {/* Nivel de Completitud */}
        <Box sx={{ 
          p: 2, 
          bgcolor: 'background.paper',
          borderRadius: 1,
          border: 1,
          borderColor: levelStyles[completionLevel].color
        }}>
          <Typography 
            variant="subtitle1"
            sx={{ color: levelStyles[completionLevel].color }}
          >
            {levelStyles[completionLevel].icon} Nivel de Completitud: {completionLevel}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
} 