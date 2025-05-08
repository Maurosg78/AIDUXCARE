import React, { useEffect, useState, useMemo } from 'react';
import { AuditLogService } from '@/core/services/AuditLogService';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Divider,
  SelectChangeEvent
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

// Mapeo de tipos de acciones a etiquetas en español
const ACTION_LABELS: Record<string, string> = {
  field_updated: 'Campo actualizado',
  suggestion_accepted: 'Sugerencia aceptada',
  copilot_intervention: 'Intervención del copiloto',
  manual_edit: 'Edición manual',
  form_submitted: 'Formulario enviado',
  ai_suggestion_accepted: 'Sugerencia IA aceptada',
  ai_suggestion_modified: 'Sugerencia IA modificada',
  ai_suggestion_rejected: 'Sugerencia IA rechazada',
  test_event: 'Evento de prueba'
};

// Mapeo de fuentes a etiquetas en español
const SOURCE_LABELS: Record<string, string> = {
  user: 'Usuario',
  copilot: 'Copiloto',
};

// Colores para los chips de fuente
const SOURCE_COLORS: Record<string, { bg: string; text: string }> = {
  user: { bg: '#e3f2fd', text: '#0d47a1' }, // Azul claro
  copilot: { bg: '#fff8e1', text: '#ff6f00' }, // Naranja claro
};

// Definir el tipo localmente para evitar problemas de namespace
interface AuditLogItem {
  id?: string;
  visitId: string;
  timestamp: string;
  action: string;
  field: string;
  oldValue?: string;
  newValue?: string;
  modifiedBy: string;
  source: 'user' | 'copilot';
}

interface AuditLogViewerProps {
  visitId?: string;
  onBack?: () => void;
}

const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ visitId, onBack }) => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [fieldSearch, setFieldSearch] = useState<string>('');

  useEffect(() => {
    const loadAuditLogs = async () => {
      if (!visitId) {
        setError('ID de visita no proporcionado');
        setLoading(false);
        return;
      }

      try {
        const auditLogs = await AuditLogService.getLogsByVisitId(visitId);
        // Ordenar por fecha descendente (más recientes primero)
        setLogs(auditLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      } catch (err) {
        console.error('Error al cargar logs de auditoría:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar los registros de auditoría');
      } finally {
        setLoading(false);
      }
    };

    loadAuditLogs();
  }, [visitId]);

  // Formatear fecha en formato español HH:MM · DD/MM/AAAA
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${hours}:${minutes} · ${day}/${month}/${year}`;
  };

  // Filtrar logs según criterios seleccionados
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesAction = !actionFilter || log.action === actionFilter;
      const matchesSource = !sourceFilter || log.source === sourceFilter;
      const matchesField = !fieldSearch || log.field.toLowerCase().includes(fieldSearch.toLowerCase());
      return matchesAction && matchesSource && matchesField;
    });
  }, [logs, actionFilter, sourceFilter, fieldSearch]);

  // Obtener acciones únicas para el selector
  const uniqueActions = useMemo(() => {
    const actions = new Set(logs.map((log) => log.action));
    return Array.from(actions);
  }, [logs]);

  // Obtener fuentes únicas para el selector
  const uniqueSources = useMemo(() => {
    const sources = new Set(logs.map((log) => log.source));
    return Array.from(sources);
  }, [logs]);

  const handleBackToVisit = () => {
    if (onBack) {
      onBack();
    } else {
      // Fallback para navegación si no se proporciona una función onBack
      window.history.back();
    }
  };

  const handleActionFilterChange = (event: SelectChangeEvent<string>) => {
    setActionFilter(event.target.value);
  };

  const handleSourceFilterChange = (event: SelectChangeEvent<string>) => {
    setSourceFilter(event.target.value);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          onClick={handleBackToVisit}
        >
          Volver a la visita
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          onClick={handleBackToVisit}
        >
          Volver a la visita
        </Button>
        <Typography variant="h5" component="h1">
          Registro de Auditoría Clínica
        </Typography>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={1}>
            <FilterListIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Filtros</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="action-filter-label">Tipo de acción</InputLabel>
                <Select
                  labelId="action-filter-label"
                  value={actionFilter}
                  label="Tipo de acción"
                  onChange={handleActionFilterChange}
                >
                  <MenuItem value="">Todas las acciones</MenuItem>
                  {uniqueActions.map((action) => (
                    <MenuItem key={action} value={action}>
                      {ACTION_LABELS[action] || action}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="source-filter-label">Fuente</InputLabel>
                <Select
                  labelId="source-filter-label"
                  value={sourceFilter}
                  label="Fuente"
                  onChange={handleSourceFilterChange}
                >
                  <MenuItem value="">Todas las fuentes</MenuItem>
                  {uniqueSources.map((source) => (
                    <MenuItem key={source} value={source}>
                      {SOURCE_LABELS[source] || source}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Buscar por campo"
                value={fieldSearch}
                onChange={(e) => setFieldSearch(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Lista de logs */}
      {filteredLogs.length > 0 ? (
        <Box>
          {filteredLogs.map((log) => (
            <Card key={log.id || `${log.timestamp}-${log.field}`} sx={{ mb: 2, borderLeft: `4px solid ${SOURCE_COLORS[log.source]?.bg || '#e0e0e0'}` }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {formatDate(log.timestamp)}
                  </Typography>
                  <Chip
                    label={SOURCE_LABELS[log.source] || log.source}
                    size="small"
                    sx={{
                      backgroundColor: SOURCE_COLORS[log.source]?.bg || '#e0e0e0',
                      color: SOURCE_COLORS[log.source]?.text || '#000',
                    }}
                  />
                </Box>
                <Typography variant="h6" component="h2">
                  {ACTION_LABELS[log.action] || log.action}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Campo: <strong>{log.field}</strong>
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Grid container spacing={2}>
                  {log.oldValue && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Valor anterior:
                      </Typography>
                      <Card variant="outlined" sx={{ mt: 1, p: 1, bgcolor: '#f5f5f5' }}>
                        <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', m: 0 }}>
                          {log.oldValue}
                        </Typography>
                      </Card>
                    </Grid>
                  )}
                  {log.newValue && (
                    <Grid item xs={12} md={log.oldValue ? 6 : 12}>
                      <Typography variant="body2" color="text.secondary">
                        Valor nuevo:
                      </Typography>
                      <Card variant="outlined" sx={{ mt: 1, p: 1, bgcolor: '#f1f8e9' }}>
                        <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', m: 0 }}>
                          {log.newValue}
                        </Typography>
                      </Card>
                    </Grid>
                  )}
                </Grid>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Modificado por: <strong>{log.modifiedBy}</strong>
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Card sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No se encontraron registros de auditoría con los filtros actuales.
          </Typography>
        </Card>
      )}
    </Box>
  );
};

// Wrapper para usar AuditLogViewer con React Router DOM
const AuditLogViewerWithRouter: React.FC = () => {
  // Obtener visitId de la URL (puedes adaptar esto según tu router)
  const visitId = window.location.pathname.split('/').pop();
  
  return <AuditLogViewer visitId={visitId} />;
};

export default AuditLogViewerWithRouter; 