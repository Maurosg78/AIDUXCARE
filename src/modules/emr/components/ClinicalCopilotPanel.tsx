import { useMemo  } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

// Interfaz específica para este componente
interface CopilotVisit {
  id: string;
  patientId: string;
  visitDate: string;
  visitType: string;
  date: string;
  reason?: string;
  notes?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

interface ClinicalCopilotPanelProps {
  visit: CopilotVisit;
}

interface Suggestion {
  id: string;
  message: string;
  icon: string;
  type: 'info' | 'warning' | 'success';
}

export default function ClinicalCopilotPanel({ visit }: ClinicalCopilotPanelProps) {
  const suggestions = useMemo(() => {
    const result: Suggestion[] = [];

    // Validar campos
    const hasMotivo = !!visit.reason?.trim();
    const hasDiagnostico = !!(visit.notes && visit.notes.includes('diagnostico:'));
    const hasTratamiento = !!(visit.notes && visit.notes.includes('tratamiento:'));

    // Regla 1: Dolor sin diagnóstico
    if (hasMotivo && visit.reason && visit.reason.toLowerCase().includes('dolor') && !hasDiagnostico) {
      result.push({
        id: 'dolor-sin-diagnostico',
        message: 'Sugerencia: Falta especificar diagnóstico para el dolor reportado.',
        icon: '🧠',
        type: 'warning'
      });
    }

    // Regla 2: Diagnóstico sin tratamiento
    if (hasDiagnostico && !hasTratamiento) {
      result.push({
        id: 'diagnostico-sin-tratamiento',
        message: 'Sugerencia: Considera incluir un plan de tratamiento asociado.',
        icon: '🧠',
        type: 'warning'
      });
    }

    // Regla 3: Tratamiento sin diagnóstico
    if (!hasDiagnostico && hasTratamiento) {
      result.push({
        id: 'tratamiento-sin-diagnostico',
        message: 'Sugerencia: Se recomienda especificar el diagnóstico que justifica el tratamiento.',
        icon: '🧠',
        type: 'warning'
      });
    }

    // Regla 4: Motivo muy corto
    if (hasMotivo && visit.reason && visit.reason.length < 20) {
      result.push({
        id: 'motivo-corto',
        message: 'Sugerencia: Considera agregar más detalles al motivo de consulta.',
        icon: '📝',
        type: 'info'
      });
    }

    // Regla 5: Todo completo
    if (hasMotivo && hasDiagnostico && hasTratamiento) {
      result.push({
        id: 'todo-completo',
        message: 'Todo parece estar en orden.',
        icon: '✅',
        type: 'success'
      });
    }

    return result;
  }, [visit]);

  // Estilos según tipo de sugerencia
  const typeStyles = {
    info: { color: '#3b82f6', bgColor: '#eff6ff' },
    warning: { color: '#f59e0b', bgColor: '#fffbeb' },
    success: { color: '#22c55e', bgColor: '#f0fdf4' }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          🤖 Copiloto Clínico
        </Typography>

        <Box sx={{ mt: 2 }}>
          {suggestions.map((suggestion) => (
            <Box
              key={suggestion.id}
              sx={{
                p: 2,
                mb: 1,
                borderRadius: 1,
                bgcolor: typeStyles[suggestion.type].bgColor,
                color: typeStyles[suggestion.type].color,
                border: 1,
                borderColor: 'currentColor'
              }}
            >
              <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {suggestion.icon} {suggestion.message}
              </Typography>
            </Box>
          ))}

          {suggestions.length === 0 && (
            <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
              No hay sugerencias en este momento.
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
} 