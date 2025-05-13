import { useEffect, useState  } from 'react';
import { AuditLogService } from '@/core/services/AuditLogService';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress, Box } from '@mui/material';

const ACTION_LABELS: Record<string, string> = {
  manual_edit: 'Edición manual',
  field_updated: 'Edición manual',
  ai_suggestion_accepted: 'Sugerencia IA aceptada',
  ai_suggestion_modified: 'Sugerencia IA editada',
  ai_suggestion_rejected: 'Sugerencia IA rechazada',
  suggestion_accepted: 'Sugerencia aceptada',
  copilot_intervention: 'Intervención Copiloto',
  form_submitted: 'Formulario enviado',
  test_event: 'Evento de prueba'
};

interface ClinicalAuditLogProps {
  visitId: string;
}

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

export const ClinicalAuditLog: React.FC<ClinicalAuditLogProps> = ({ visitId }) => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    AuditLogService.getLogsByVisitId(visitId)
      .then((data) => {
        if (mounted) setLogs(data.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
      })
      .catch((err) => {
        console.error('Error al cargar logs de auditoría:', err);
        if (mounted) setError('Error al cargar los eventos clínicos.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [visitId]);

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}><CircularProgress /></Box>;
  }
  if (error) {
    return <Typography color="error" align="center">{error}</Typography>;
  }
  if (!logs.length) {
    return <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>No hay eventos registrados para esta visita.</Typography>;
  }

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table aria-label="Tabla de eventos clínicos" size="small">
        <TableHead>
          <TableRow>
            <TableCell><b>Fecha/Hora</b></TableCell>
            <TableCell><b>Campo</b></TableCell>
            <TableCell><b>Acción</b></TableCell>
            <TableCell><b>Usuario</b></TableCell>
            <TableCell><b>Valor anterior</b></TableCell>
            <TableCell><b>Valor nuevo</b></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id || `${log.timestamp}-${log.field}`} tabIndex={0}>
              <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
              <TableCell>{log.field}</TableCell>
              <TableCell>{ACTION_LABELS[log.action] || log.action}</TableCell>
              <TableCell>{log.modifiedBy}</TableCell>
              <TableCell>{log.oldValue ?? '-'}</TableCell>
              <TableCell>{log.newValue ?? '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ClinicalAuditLog; 