import { useEffect  } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Alert, Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { MCPContextView } from '../../components/MCPContextView/MCPContextView';
import { MCPErrorBoundary } from '../../components/MCPContextView/MCPErrorBoundary';
import { trackEvent } from '../../core/lib/langfuse.client';
import type { UserRole  } from '../../core/types/UserRoles';
import AccessControl from '../../components/auth/AccessControl';

/**
 * Página que muestra el contexto MCP para una visita específica
 * Solo accesible para profesionales de la salud
 */
const MCPPage: React.FC = () => {
  const { visitId } = useParams<{ visitId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!visitId) {
      navigate('/404');
      return;
    }

    // Registrar visualización de página
    trackEvent('mcp_page_view', {
      visit_id: visitId,
      timestamp: new Date().toISOString()
    });
  }, [visitId, navigate]);

  const handleError = (error: Error) => {
    // Si es error 404, redirigir a página de error
    if (error.message.includes('Visita no encontrada')) {
      navigate('/404', { 
        state: { 
          message: t('mcp.errors.visit_not_found'),
          returnPath: '/visits'
        }
      });
    }

    // Registrar error
    trackEvent('mcp_page_error', {
      visit_id: visitId,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  };

  if (!visitId) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          {t('mcp.errors.invalid_visit_id')}
        </Alert>
      </Container>
    );
  }

  return (
    <AccessControl 
      allowedRoles={[UserRole.PROFESSIONAL, UserRole.ADMIN]} 
      fallback={
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Alert severity="error">
            {t('access.denied')}
          </Alert>
        </Container>
      }
    >
      <MCPErrorBoundary>
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            {t('mcp.page_title')}
          </Typography>
          
          <MCPContextView 
            visitId={visitId} 
            onError={handleError}
          />
        </Container>
      </MCPErrorBoundary>
    </AccessControl>
  );
};

export default MCPPage; 