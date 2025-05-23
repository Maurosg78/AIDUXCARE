import { useEffect, useState  } from 'react';
import { AuditLogService } from '@/core/services/AuditLogService';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress, Box } from '@mui/material';
import type { AuditLogEvent } from '@/core/types';

// Mapeo de tipos de acciones a etiquetas legibles
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

// Tipo específico para las entradas de auditoría clínica con tipos estrictos
interface ClinicalAuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  visitId: string;
  field: string;
  oldValue?: string;
  newValue?: string;
  modifiedBy: string;
  source: 'user' | 'copilot';
}

// Definimos la interfaz AuditLogEvent aquí, similar a la de @/core/types
interface AuditLogEvent {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export const ClinicalAuditLog: React.FC<ClinicalAuditLogProps> = ({ visitId }) => {
  const [logs, setLogs] = useState<ClinicalAuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    
    AuditLogService.getAuditLogs({
      resourceType: 'visit',
      resourceId: visitId,
    })
      .then((data: AuditLogEvent[]) => {
        if (!mounted) return;
        
        // Adaptar los datos del servicio al formato específico de este componente
        const adaptedLogs: ClinicalAuditLogEntry[] = data.map((item) => {
          // Extraer valores con tipado seguro
          const details = item.details || {};
          
          return {
            id: item.id,
            timestamp: item.timestamp,
            action: item.action,
            visitId: item.resourceId,
            field: typeof details.field === 'string' ? details.field : 'general',
            oldValue: typeof details.oldValue === 'string' ? details.oldValue : undefined,
            newValue: typeof details.newValue === 'string' ? details.newValue : undefined,
            modifiedBy: typeof details.modifiedBy === 'string' ? 
              details.modifiedBy : item.userId,
            source: details.source === 'copilot' ? 'copilot' : 'user'
          };
        });
        
        // Ordenar por fecha descendente
        setLogs(adaptedLogs.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
      })
      .catch((err: Error) => {
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