/**
 * Cliente Langfuse para entorno de servidor - Versión simplificada
 */

interface LangfuseConfig {
  publicKey?: string;
  baseUrl?: string;
}

interface TraceOptions {
  name: string;
  metadata?: Record<string, unknown>;
}

// Parámetros posibles para eventos
export interface EventParams {
  name: string;
  payload?: Record<string, unknown>;
  traceId?: string;
}

export type EventOptions = string | EventParams;

// Configuración para Langfuse Server
const langfuseConfig: LangfuseConfig = {
  publicKey: process.env.VITE_LANGFUSE_PUBLIC_KEY,
  baseUrl: process.env.VITE_LANGFUSE_BASE_URL
};

// Función para verificar si tenemos las credenciales necesarias
export const isLangfuseConfigured = (): boolean => {
  return !!langfuseConfig.publicKey;
};

// Implementación mock del cliente Langfuse para servidor
class ServerLangfuseClient {
  constructor(private config: LangfuseConfig) {}
  
  async trace(options: TraceOptions): Promise<{ id: string }> {
    console.log('[Langfuse Server] Trace:', options);
    return { id: `mock-trace-${Date.now()}` };
  }
  
  async observation(traceId: string, options: any): Promise<{ id: string }> {
    console.log('[Langfuse Server] Observation:', { traceId, ...options });
    return { id: `mock-obs-${Date.now()}` };
  }
}

// Crear instancia del cliente
export const langfuse = new ServerLangfuseClient(langfuseConfig);

/**
 * Seguir un evento en Langfuse con nombre y metadatos
 * Soporta ambos formatos de llamada:
 * 1. trackServerEvent({ name, payload, traceId })
 * 2. trackServerEvent(name, metadata)
 */
export const trackServerEvent = async (
  eventOrName: EventOptions,
  metadata?: Record<string, unknown>
): Promise<{ id: string }> => {
  try {
    let name: string;
    let payload: Record<string, unknown> = {};
    let traceId: string | undefined;
    
    // Detectar qué formato de parámetros se está utilizando
    if (typeof eventOrName === 'string') {
      // Formato antiguo: trackServerEvent(name, metadata)
      name = eventOrName;
      payload = metadata || {};
    } else {
      // Formato nuevo: trackServerEvent({ name, payload, traceId })
      name = eventOrName.name;
      payload = eventOrName.payload || {};
      traceId = eventOrName.traceId;
    }
    
    return await langfuse.trace({
      name,
      metadata: {
        ...payload,
        source: 'server',
        timestamp: new Date().toISOString(),
        traceId
      }
    });
  } catch (error) {
    console.error('Error al enviar evento a Langfuse:', error);
    return { id: `error-${Date.now()}` };
  }
};

