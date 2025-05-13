import React from 'react';
import { Alert, Typography } from '@mui/material';
import { trackEvent } from '../../core/lib/langfuse.client';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary específico para el contexto MCP
 * Captura errores en el árbol de componentes y muestra un mensaje amigable
 */
export class MCPErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Registrar el error para análisis
    trackEvent('mcp_error_boundary', {
      error: error.message,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert 
          severity="error"
          role="alert"
          aria-live="polite"
          sx={{ margin: '1rem' }}
        >
          <Typography variant="h6" gutterBottom>
            Error en el Contexto MCP
          </Typography>
          <Typography variant="body2">
            Ha ocurrido un error al procesar el contexto clínico. Por favor, intente recargar la página.
          </Typography>
          {this.state.error && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Detalles: {this.state.error.message}
            </Typography>
          )}
        </Alert>
      );
    }

    return this.props.children;
  }
} 