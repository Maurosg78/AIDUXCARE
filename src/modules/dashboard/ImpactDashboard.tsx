import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Alert,
  Divider,
  Paper
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import EvalService from '../emr/services/EvalService';
import { processMetrics, DashboardMetrics } from './metrics';

// Componente para las tarjetas de métricas
interface MetricCardProps {
  title: string;
  value: number | string;
  isError?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, isError }) => (
  <Card>
    <CardContent>
      <Typography color="textSecondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" color={isError ? 'error' : 'inherit'}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const ImpactDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const evaluations = await EvalService.getAllEvals();
        const processedMetrics = processMetrics(evaluations);
        setMetrics(processedMetrics);
      } catch (err) {
        setError('Error al cargar las métricas');
        console.error(err);
      }
    };
    loadMetrics();
  }, []);

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!metrics) {
    return <Alert severity="info">Cargando métricas...</Alert>;
  }

  const feedbackData = [
    { name: 'Omisiones', value: metrics.feedbackByType.omission },
    { name: 'Sugerencias', value: metrics.feedbackByType.suggestion },
    { name: 'Diagnósticos', value: metrics.feedbackByType.diagnostic },
    { name: 'Riesgos', value: metrics.feedbackByType.risk }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard de Impacto
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
        <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6', lg: 'span 3' } }}>
          <MetricCard 
            title="Total Evaluaciones"
            value={metrics.totalEvaluations}
          />
        </Box>

        <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6', lg: 'span 3' } }}>
          <MetricCard 
            title="Con Feedback"
            value={metrics.evaluationsWithFeedback}
          />
        </Box>

        <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6', lg: 'span 3' } }}>
          <MetricCard 
            title="Alertas Críticas"
            value={metrics.criticalAlerts}
            isError
          />
        </Box>

        <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6', lg: 'span 3' } }}>
          <MetricCard 
            title="Pacientes con Alertas"
            value={metrics.patientsWithAlerts.length}
          />
        </Box>

        <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 8' } }}>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Feedback por Tipo
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={feedbackData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Box>

        <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Pacientes con Alertas Activas
            </Typography>
            <List>
              {metrics.patientsWithAlerts.map((patient, index) => (
                <React.Fragment key={patient.patientId}>
                  <ListItem>
                    <ListItemText
                      primary={patient.patientName}
                      secondary={patient.alerts.map(a => a.message).join(', ')}
                    />
                  </ListItem>
                  {index < metrics.patientsWithAlerts.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Box>

        <Box sx={{ gridColumn: 'span 12' }}>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top 3 Diagnósticos Sugeridos
            </Typography>
            <List>
              {metrics.topDiagnostics.map((diagnostic, index) => (
                <React.Fragment key={diagnostic.diagnosis}>
                  <ListItem>
                    <ListItemText
                      primary={diagnostic.diagnosis}
                      secondary={`Sugerido ${diagnostic.count} veces`}
                    />
                  </ListItem>
                  {index < metrics.topDiagnostics.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default ImpactDashboard; 