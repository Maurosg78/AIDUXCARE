import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { MCPContext, MCPContextSchema } from '../../core/mcp/CopilotContextBuilder';
import { trackEvent } from '../../core/lib/langfuse.client';

/**
 * Hook personalizado para obtener y gestionar el contexto MCP
 * @param visitId - ID de la visita para obtener el contexto
 * @returns Objeto con el estado de la consulta incluyendo datos, loading y error
 */
export const useMCPContext = (visitId?: string) => {
  return useQuery({
    queryKey: ['mcp-context', visitId],
    queryFn: async () => {
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
        trackEvent('mcp_loaded', {
          visitId,
          timestamp: new Date().toISOString()
        });

        return validatedContext;
      } catch (err) {
        // Registrar evento de error
        trackEvent('mcp_error', {
          visitId,
          error: err instanceof Error ? err.message : 'Error desconocido',
          timestamp: new Date().toISOString()
        });
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 30 * 60 * 1000, // 30 minutos
    retry: 2,
    enabled: !!visitId
  });
}; 