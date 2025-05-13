import { useEffect, useState  } from 'react';
import { Box, Typography, Card, CardContent, Stack, Alert, Select, MenuItem, FormControl, InputLabel, TextField } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import EvalService, { PatientEval, EvalFilter } from '../services/EvalService';
import CopilotService, { CopilotFeedback } from '@/modules/ai/CopilotService';
import LangfuseLink from '@/modules/ai/components/LangfuseLink';
import { es } from 'date-fns/locale';
import type { AdaptedPatientEval } from '@/types/component-adapters';

interface EvalTimelineProps {
  patientId: string;
}

const EvalTimeline: React.FC<EvalTimelineProps> = ({ patientId }) => {
  const [evals, setEvals] = useState<PatientEval[]>([]);
  const [filteredEvals, setFilteredEvals] = useState<PatientEval[]>([]);
  const [filters, setFilters] = useState<EvalFilter>({});
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    const loadEvals = async () => {
      const patientEvals = await EvalService.getPatientEvals(patientId);
      setEvals(patientEvals);
      setFilteredEvals(patientEvals);
    };
    loadEvals();
  }, [patientId]);

  useEffect(() => {
    const applyFilters = async () => {
      const newFilters: EvalFilter = {
        ...filters,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };
      const filtered = await EvalService.filterEvals(evals, newFilters);
      setFilteredEvals(filtered);
    };
    applyFilters();
  }, [filters, startDate, endDate, evals]);

  const handleFeedbackTypeChange = (type: 'alerta' | 'sugerencia' | 'test' | undefined) => {
    setFilters({ ...filters, feedbackType: type });
  };

  const getFeedbackIcon = (type: CopilotFeedback['type']) => {
    switch (type) {
      case 'omission': return '⚠️';
      case 'suggestion': return '💡';
      case 'diagnostic': return '🔍';
      case 'risk': return '🚨';
      default: return 'ℹ️';
    }
  };

  const getAlertSeverity = (severity: CopilotFeedback['severity']) => {
    switch (severity) {
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'info';
    }
  };

  if (!evals.length) {
    return (
      <Box sx={{ mt: 4, p: 2 }}>
        <Alert severity="info">Sin evaluaciones disponibles</Alert>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Cronología de Evaluaciones
        </Typography>
        
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <DatePicker
            label="Fecha inicio"
            value={startDate}
            onChange={(newDate) => setStartDate(newDate)}
            renderInput={(params) => <TextField {...params} variant="outlined" size="small" fullWidth />}
          />
          <DatePicker
            label="Fecha fin"
            value={endDate}
            onChange={(newDate) => setEndDate(newDate)}
            renderInput={(params) => <TextField {...params} variant="outlined" size="small" fullWidth />}
          />
          <FormControl size="small" fullWidth>
            <InputLabel id="feedback-type-label">Tipo de feedback</InputLabel>
            <Select
              labelId="feedback-type-label"
              value={filters.feedbackType || ''}
              label="Tipo de feedback"
              onChange={(e) => handleFeedbackTypeChange(e.target.value === '' ? undefined : e.target.value as 'alerta' | 'sugerencia' | 'test')}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="alerta">Alertas</MenuItem>
              <MenuItem value="sugerencia">Sugerencias</MenuItem>
              <MenuItem value="test">Tests</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Stack spacing={2}>
          {filteredEvals.map((evaluation, index) => {
            const feedbacks = CopilotService.analyzeEval(evaluation);
            return (
              <Card key={index} variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" color="primary">
                    {new Date(evaluation.createdAt || new Date().toISOString()).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {evaluation.motivo}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {evaluation.observations}
                  </Typography>
                  
                  {/* Alertas originales */}
                  {evaluation.alertas && evaluation.alertas.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      {evaluation.alertas.map((alerta, i) => (
                        <Alert key={i} severity="warning" sx={{ mt: 1 }}>
                          {alerta}
                        </Alert>
                      ))}
                    </Box>
                  )}

                  {/* Feedback del Copilot */}
                  {feedbacks.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        Análisis AI
                      </Typography>
                      {feedbacks.map((feedback, i) => (
                        <Alert 
                          key={i} 
                          severity={getAlertSeverity(feedback.severity)} 
                          sx={{ mt: 1 }}
                          icon={getFeedbackIcon(feedback.type)}
                        >
                          {feedback.message}
                        </Alert>
                      ))}
                      {evaluation.traceId && (
                        <LangfuseLink 
                          traceId={evaluation.traceId} 
                          patientId={evaluation.patientId} 
                        />
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      </Box>
    </LocalizationProvider>
  );
};

export default EvalTimeline; 