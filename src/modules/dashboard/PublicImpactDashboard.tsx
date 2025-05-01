import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  AlertTitle
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import simulatedData from '@/public-data/evals-simulated.json';

interface FeedbackMetrics {
  omission: number;
  suggestion: number;
  diagnostic: number;
  risk: number;
}

interface DashboardMetrics {
  totalEvaluations: number;
  withFeedback: number;
  withAlerts: number;
  feedbackTypes: FeedbackMetrics;
  diagnosticosAlternativos: string[];
}

const PublicImpactDashboard: React.FC = () => {
  const [metrics] = useState<DashboardMetrics>(simulatedData.metrics);

  const feedbackData = [
    { name: 'Omisiones', value: metrics.feedbackTypes.omission },
    { name: 'Sugerencias', value: metrics.feedbackTypes.suggestion },
    { name: 'Diagnósticos', value: metrics.feedbackTypes.diagnostic },
    { name: 'Riesgos', value: metrics.feedbackTypes.risk }
  ];

  const getFeedbackPercentage = () => {
    return ((metrics.withFeedback / metrics.totalEvaluations) * 100).toFixed(1);
  };

  const getAlertsPercentage = () => {
    return ((metrics.withAlerts / metrics.totalEvaluations) * 100).toFixed(1);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard de Impacto Clínico
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Versión de demostración con datos simulados
      </Typography>

      <Box
        component="div"
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(12, 1fr)'
          },
          gap: 3,
          mt: 2
        }}
      >
        {/* Métricas principales */}
        <Box component="div" sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total de Evaluaciones
              </Typography>
              <Typography variant="h3" color="primary">
                {metrics.totalEvaluations}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box component="div" sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Con Feedback
              </Typography>
              <Typography variant="h3" color="primary">
                {getFeedbackPercentage()}%
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box component="div" sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Con Alertas
              </Typography>
              <Typography variant="h3" color="error">
                {getAlertsPercentage()}%
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Gráfico de tipos de feedback */}
        <Box component="div" sx={{ gridColumn: { xs: 'span 1', md: 'span 8' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Distribución de Feedback
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={feedbackData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#1976d2" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Diagnósticos alternativos */}
        <Box component="div" sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Diagnósticos Alternativos Sugeridos
              </Typography>
              <List>
                {metrics.diagnosticosAlternativos.map((diagnostico) => (
                  <React.Fragment key={diagnostico}>
                    <ListItem>
                      <ListItemText primary={diagnostico} />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mt: 3 }}>
        <AlertTitle>Nota</AlertTitle>
        Este dashboard muestra datos simulados para fines de demostración. Los datos reales están protegidos y requieren autenticación.
      </Alert>
    </Box>
  );
};

export default PublicImpactDashboard; 