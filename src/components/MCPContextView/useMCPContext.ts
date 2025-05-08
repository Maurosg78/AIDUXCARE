import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { MCPContextSchema } from '../../core/mcp/CopilotContextBuilder';
import { trackEvent } from '../../core/lib/langfuse.client';

/**
 * Hook personalizado para obtener y gestionar el contexto MCP
 * @param visitId - ID de la visita para obtener el contexto
 * @returns Objeto con el estado de la consulta incluyendo datos, loading y error
 */
export const useMCPContext = (visitId?: string) => {
  return useQuery({
    queryKey: ['mcp-context', visitId],
    queryFn: () => fetchMCPContext(visitId),
    gcTime: 30 * 60 * 1000, // 30 minutos
    retry: 1,
    enabled: !!visitId
  });
};

async function fetchMCPContext(visitId?: string) {
  if (!visitId) {
    throw new Error('Se requiere ID de visita');
  }

  try {
    const response = await axios.post('/api/mcp/invoke', {
      visit_id: visitId,
      timestamp: new Date().toISOString()
    });

    const validatedContext = MCPContextSchema.parse(response.data);
    
    // Registrar evento exitoso
    await trackEvent('mcp_loaded', {
      visitId,
      timestamp: new Date().toISOString()
    });

    return validatedContext;
  } catch (err) {
    // Registrar evento de error
    await trackEvent('mcp_error', {
      visitId,
      error: err instanceof Error ? err.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    });
    throw err;
  }
} 