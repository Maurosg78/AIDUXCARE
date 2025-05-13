import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider
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

interface ImpactMetrics {
  totalEvaluations: number;
  withFeedback: number;
  withAlerts: number;
  feedbackTypes: {
    omission: number;
    suggestion: number;
    diagnostic: number;
    risk: number;
  };
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
}

interface ImpactDashboardProps {
  metrics: ImpactMetrics;
  testimonials: Testimonial[];
}

const ImpactDashboard: React.FC<ImpactDashboardProps> = ({ metrics, testimonials }) => {
  const feedbackData = [
    { name: 'Omisiones', value: metrics.feedbackTypes.omission },
    { name: 'Sugerencias', value: metrics.feedbackTypes.suggestion },
    { name: 'Diagnósticos', value: metrics.feedbackTypes.diagnostic },
    { name: 'Riesgos', value: metrics.feedbackTypes.risk }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard de Impacto
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
        <Box component="div" sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
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

        <Box component="div" sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Con Feedback
              </Typography>
              <Typography variant="h3" color="primary">
                {((metrics.withFeedback / metrics.totalEvaluations) * 100).toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box component="div" sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Con Alertas
              </Typography>
              <Typography variant="h3" color="error">
                {((metrics.withAlerts / metrics.totalEvaluations) * 100).toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box component="div" sx={{ gridColumn: { xs: 'span 12', md: 'span 8' } }}>
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

        <Box component="div" sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Testimonios
              </Typography>
              <List>
                {testimonials.map((testimonial) => (
                  <React.Fragment key={testimonial.id}>
                    <ListItem>
                      <ListItemText
                        primary={`${testimonial.name} - ${testimonial.role}`}
                        secondary={testimonial.content}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default ImpactDashboard; 