import { Suspense  } from 'react';
import { useParams } from '@/core/utils/router';
import { CircularProgress, Alert, Grid, Skeleton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { MCPContext, MCPContextSchema } from '../../core/mcp/CopilotContextBuilder';
import { useMCPContext } from './useMCPContext';
import { MCPErrorBoundary } from './MCPErrorBoundary';
import { PatientInfoCard } from './PatientInfoCard';
import { VisitHistoryCard } from './VisitHistoryCard';
import { CurrentVisitCard } from './CurrentVisitCard';
import { SystemRulesCard } from './SystemRulesCard';

export interface MCPContextViewProps {
  visitId?: string;
  onError?: (error: Error) => void;
}

/**
 * Componente principal para visualizar el contexto MCP
 * Incluye información del paciente, historial de visitas y reglas del sistema
 */
export const MCPContextView: React.FC<MCPContextViewProps> = React.memo(({ visitId: propVisitId, onError }) => {
  const { t } = useTranslation();
  const { id: routeVisitId } = useParams<{ id: string }>();
  const visitId = propVisitId || routeVisitId;

  const { data: context, isLoading, error } = useMCPContext(visitId);

  if (isLoading) {
    return (
      <div 
        style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}
        role="progressbar"
        aria-label={t('mcp.loading')}
      >
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : t('mcp.errors.loading');
    onError?.(error instanceof Error ? error : new Error(errorMessage));
    return (
      <Alert 
        severity="error" 
        sx={{ margin: '1rem' }}
        role="alert"
      >
        {errorMessage}
      </Alert>
    );
  }

  if (!context) {
    return (
      <Alert 
        severity="warning" 
        sx={{ margin: '1rem' }}
        role="alert"
      >
        {t('mcp.errors.not_found')}
      </Alert>
    );
  }

  try {
    MCPContextSchema.parse(context);
  } catch (validationError) {
    console.error('Error de validación del contexto MCP:', validationError);
    return (
      <Alert 
        severity="error" 
        sx={{ margin: '1rem' }}
        role="alert"
      >
        {t('mcp.errors.validation')}
      </Alert>
    );
  }

  // Asegurarnos de que context tiene la forma correcta (por defecto)
  const typedContext = context as MCPContext;
  const { 
    patient_state = { age: 0, sex: "M", history: [] }, 
    visit_metadata = { professional: '', date: '', visit_id: '' }, 
    rules_and_constraints = [], 
    system_instructions = '', 
    enrichment = { 
      similar_patients: [], 
      clinical_guidelines: [], 
      suggested_treatments: [], 
      risk_factors: [] 
    }
  } = typedContext;

  return (
    <MCPErrorBoundary>
      <Grid 
        container 
        spacing={3} 
        sx={{ padding: '1rem' }}
        role="region"
        aria-label={t('mcp.patient_info.title')}
      >
        {/* Información del Paciente */}
        <Grid item xs={12} md={6}>
          <PatientInfoCard patientState={patient_state} enrichment={enrichment} />
        </Grid>

        {/* Historial de Visitas */}
        <Grid item xs={12} md={6}>
          <Suspense fallback={<Skeleton variant="rectangular" height={200} />}>
            <VisitHistoryCard enrichment={enrichment} />
          </Suspense>
        </Grid>

        {/* Datos de la Visita Actual */}
        <Grid item xs={12} md={6}>
          <Suspense fallback={<Skeleton variant="rectangular" height={200} />}>
            <CurrentVisitCard visitMetadata={visit_metadata} />
          </Suspense>
        </Grid>

        {/* Reglas y Restricciones del Sistema */}
        <Grid item xs={12} md={6}>
          <Suspense fallback={<Skeleton variant="rectangular" height={200} />}>
            <SystemRulesCard
              rules={rules_and_constraints}
              instructions={system_instructions}
            />
          </Suspense>
        </Grid>
      </Grid>
    </MCPErrorBoundary>
  );
}); 