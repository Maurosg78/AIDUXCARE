import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import EvalService from '../emr/services/EvalService';
import { processMetrics, DashboardMetrics, PatientAlert, DiagnosticCount } from './metrics';

interface MetricCardProps {
  title: string;
  value: number | string;
  isError?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, isError }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h3" color={isError ? 'error' : 'primary'}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const ImpactDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalEvaluations: 0,
    withFeedback: 0,
    withAlerts: 0,
    feedbackTypes: {
      omission: 0,
      suggestion: 0,
      diagnostic: 0,
      risk: 0
    },
    patientsWithAlerts: [],
    topDiagnostics: []
  });

  useEffect(() => {
    const loadEvaluations = async () => {
      try {
        const evaluations = await EvalService.getEvaluations();
        const newMetrics = processMetrics(evaluations);
        setMetrics(newMetrics);
      } catch (error) {
        console.error('Error loading evaluations:', error);
      }
    };
    loadEvaluations();
  }, []);

  const feedbackData = [
    { name: 'Omisiones', value: metrics.feedbackTypes.omission },
    { name: 'Sugerencias', value: metrics.feedbackTypes.suggestion },
    { name: 'Diagnósticos', value: metrics.feedbackTypes.diagnostic },
    { name: 'Riesgos', value: metrics.feedbackTypes.risk }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard de Impacto Clínico
      </Typography>

      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: 'repeat(3, 1fr)'
        },
        gap: 3
      }}>
        <Box>
          <MetricCard
            title="Total de Evaluaciones"
            value={metrics.totalEvaluations}
          />
        </Box>

        <Box>
          <MetricCard
            title="Con Feedback"
            value={`${((metrics.withFeedback / metrics.totalEvaluations) * 100).toFixed(1)}%`}
          />
        </Box>

        <Box>
          <MetricCard
            title="Con Alertas"
            value={`${((metrics.withAlerts / metrics.totalEvaluations) * 100).toFixed(1)}%`}
            isError
          />
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3, mt: 3 }}>
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
              {metrics.patientsWithAlerts.map((patient: PatientAlert, index: number) => (
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
              {metrics.topDiagnostics.map((diagnostic: DiagnosticCount, index: number) => (
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