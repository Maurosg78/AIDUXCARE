import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  CircularProgress,
  Chip,
  LinearProgress
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningIcon from '@mui/icons-material/Warning';
import type { ImpactStats } from '@/mock/impactStats';
import mockImpactStats from '@/mock/impactStats';
import { useAuth } from '@/core/context/AuthContext';

interface ImpactDashboardProps {
  professionalId?: string;
}

const ACTION_LABELS: Record<string, string> = {
  'ai_suggestion_accepted': 'Sugerencia IA aceptada',
  'ai_suggestion_modified': 'Sugerencia IA modificada',
  'ai_suggestion_rejected': 'Sugerencia IA rechazada'
};

/**
 * Panel de impacto clínico que muestra métricas de uso del copiloto IA
 * y estadísticas de rendimiento del profesional.
 */
const ImpactDashboard: React.FC<ImpactDashboardProps> = ({ professionalId }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ImpactStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // En una implementación real, esto sería una llamada a la API
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      try {
        // Simular carga de datos
        const id = professionalId || (user?.email ? 'prof-001' : 'prof-001');
        const data = mockImpactStats[id];
        
        if (!data) {
          setError('No se encontraron estadísticas para este profesional');
          setLoading(false);
          return;
        }
        
        setStats(data);
        setLoading(false);
      } catch {
        setError('Error al cargar las estadísticas de impacto');
        setLoading(false);
      }
    }, 800); // Simular retardo de red
  }, [professionalId, user]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !stats) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="error">{error || 'Datos no disponibles'}</Typography>
      </Box>
    );
  }

  // Calcular tasa de aceptación
  const acceptanceRate = stats.totalSuggestions > 0 
    ? ((stats.acceptedSuggestions + stats.modifiedSuggestions) / stats.totalSuggestions) * 100 
    : 0;

  // Preparar datos para el gráfico de distribución por tipo
  const suggestionTypeData = [
    { name: 'Diagnóstico', value: stats.suggestionsByType.diagnostico },
    { name: 'Evaluación', value: stats.suggestionsByType.evaluacion },
    { name: 'Tratamiento', value: stats.suggestionsByType.tratamiento },
    { name: 'Seguimiento', value: stats.suggestionsByType.seguimiento }
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Panel de Impacto Clínico
      </Typography>
      
      <Grid container spacing={3}>
        {/* Tarjetas resumen */}
        <Grid item xs={12} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Sugerencias IA
              </Typography>
              <Typography variant="h3">
                {stats.totalSuggestions}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total de sugerencias generadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" color="success.main" gutterBottom>
                <Box display="flex" alignItems="center">
                  <CheckCircleIcon sx={{ mr: 1 }} />
                  Tasa de Aceptación
                </Box>
              </Typography>
              <Typography variant="h3">
                {acceptanceRate.toFixed(1)}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={acceptanceRate} 
                color="success"
                sx={{ mt: 1, mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                {stats.acceptedSuggestions} aceptadas, {stats.modifiedSuggestions} modificadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" color="info.main" gutterBottom>
                <Box display="flex" alignItems="center">
                  <AccessTimeIcon sx={{ mr: 1 }} />
                  Tiempo Ahorrado
                </Box>
              </Typography>
              <Typography variant="h3">
                {stats.estimatedTimeSaved} min
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Aproximadamente {Math.round(stats.estimatedTimeSaved / 60)} horas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" color="warning.main" gutterBottom>
                <Box display="flex" alignItems="center">
                  <WarningIcon sx={{ mr: 1 }} />
                  Alertas Prevenidas
                </Box>
              </Typography>
              <Typography variant="h3">
                {stats.preventedAlerts}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Posibles problemas detectados por el copiloto
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Gráficos */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sugerencias Mensuales
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.monthlySuggestions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3f51b5" name="Sugerencias" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tasa de Aceptación Mensual
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.monthlyAcceptanceRate}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                    <Tooltip formatter={(value) => [`${(Number(value) * 100).toFixed(1)}%`, 'Tasa']} />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#4caf50" 
                      name="Tasa de Aceptación"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Distribución por Tipo
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={suggestionTypeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#ff9800" name="Cantidad" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Actividad Reciente
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Fecha/Hora</TableCell>
                      <TableCell>Acción</TableCell>
                      <TableCell>Campo</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.recentActivity.map((activity, index) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(activity.timestamp).toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip 
                            size="small"
                            label={ACTION_LABELS[activity.action] || activity.action}
                            icon={
                              activity.action === 'ai_suggestion_accepted' ? <CheckCircleIcon fontSize="small" /> :
                              activity.action === 'ai_suggestion_modified' ? <EditIcon fontSize="small" /> :
                              <CancelIcon fontSize="small" />
                            }
                            color={
                              activity.action === 'ai_suggestion_accepted' ? 'success' :
                              activity.action === 'ai_suggestion_modified' ? 'primary' :
                              'error'
                            }
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{activity.field}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ImpactDashboard; 