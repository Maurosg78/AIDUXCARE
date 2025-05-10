import { langfuseClient, verifyLangfuseConfig as verifyConfig, mockLangfuseEvent } from './langfuse.config';

/**
 * Función unificada para verificar la configuración de Langfuse
 * @returns {boolean} true si la configuración es válida
 */
export const verifyLangfuseConfig = (): boolean => {
  return verifyConfig();
};

/**
 * Registra un evento en Langfuse o usa el mock en desarrollo
 * @param {string} name - Nombre del evento
 * @param {Record<string, unknown>} metadata - Metadatos adicionales
 * @returns {Promise<void>}
 */
export const trackEvent = async (
  name: string,
  metadata: Record<string, unknown> = {}
): Promise<void> => {
  try {
    if (langfuseClient) {
      await langfuseClient.event({
        name,
        metadata
      });
    } else {
      // Si no hay cliente real, usar mock
      await mockLangfuseEvent(name, metadata);
    }
  } catch (error) {
    console.warn('[AiDuxCare] Error al registrar evento Langfuse:', error);
  }
};

/**
 * Obtiene el ID del trazo actual (o un ID simulado en desarrollo)
 * @param {string} fallbackId - ID alternativo si no hay trace
 * @returns {string} ID del trace
 */
export const getCurrentTraceId = (fallbackId?: string): string => {
  try {
    // Implementación simulada - en producción requeriría más lógica
    return fallbackId || `trace-${Date.now()}`;
  } catch (error) {
    console.warn('[AiDuxCare] Error al obtener trace ID:', error);
    return fallbackId || 'mock-trace';
  }
};
