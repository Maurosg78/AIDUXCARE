/**
 * Cliente Langfuse simplificado para TypeScript
 */

// Definir interfaces mínimas para Langfuse
export interface LangfuseOptions {
  publicKey?: string;
  baseUrl?: string;
}

export interface LangfuseObservation {
  id: string;
  name: string;
  startTime?: string;
  endTime?: string;
  metadata?: Record<string, unknown>;
}

export interface LangfuseTrace {
  id: string;
  name: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  observations?: LangfuseObservation[];
  startTime?: string;
  endTime?: string;
}

export interface TraceOptions {
  name: string;
  metadata?: Record<string, unknown>;
  userId?: string;
  id?: string;
}

export interface ObservationOptions {
  name: string;
  metadata?: Record<string, unknown>;
  startTime?: string;
  endTime?: string;
}

// Soporte para eventos en la interfaz actual
export interface EventParams {
  name: string;
  payload?: Record<string, unknown>;
  traceId?: string;
}

// Soporte para uso con parámetros por separado (formato antiguo)
export type EventOptions = string | EventParams;

// Configuración de cliente Langfuse
const langfuseConfig: LangfuseOptions = {
  publicKey: import.meta.env.VITE_LANGFUSE_PUBLIC_KEY,
  baseUrl: import.meta.env.VITE_LANGFUSE_BASE_URL
};

// Verificar si las credenciales están presentes
const hasCredentials = !!langfuseConfig.publicKey;

// Mock implementación del cliente Langfuse
export class LangfuseClient {
  private traces: LangfuseTrace[] = [];
  
  constructor(private options: LangfuseOptions = {}) {}
  
  async trace(options: TraceOptions): Promise<{ id: string }> {
    // Crear ID único si no se proporciona
    const id = options.id || `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Crear trace simulado
    const trace: LangfuseTrace = {
      id,
      name: options.name,
      userId: options.userId,
      metadata: options.metadata,
      observations: [],
      startTime: new Date().toISOString()
    };
    
    // Almacenar localmente
    this.traces.push(trace);
    
    console.log('[Langfuse] Created trace:', trace);
    return { id };
  }
  
  async observation(traceId: string, options: ObservationOptions): Promise<{ id: string }> {
    const id = `obs-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Crear observación simulada
    const observation: LangfuseObservation = {
      id,
      name: options.name,
      metadata: options.metadata,
      startTime: options.startTime || new Date().toISOString(),
      endTime: options.endTime
    };
    
    // Buscar trace y añadir observación
    const trace = this.traces.find(t => t.id === traceId);
    if (trace && trace.observations) {
      trace.observations.push(observation);
    }
    
    console.log('[Langfuse] Created observation:', observation);
    return { id };
  }
}

// Crear una instancia del cliente Langfuse
export const langfuseClient = new LangfuseClient(langfuseConfig);

/**
 * Verificar que la configuración de Langfuse está presente
 */
export const verifyLangfuseConfig = (): boolean => {
  return hasCredentials;
};

/**
 * Seguir un evento en Langfuse con nombre y metadatos
 * Soporta ambos formatos de llamada:
 * 1. trackEvent({ name, payload, traceId })
 * 2. trackEvent(name, metadata)
 */
export const trackEvent = async (
  eventOrName: EventOptions,
  metadata?: Record<string, unknown>
): Promise<{ id: string } | null> => {
  try {
    let name: string;
    let payload: Record<string, unknown> = {};
    let traceId: string | undefined;
    
    // Detectar qué formato de parámetros se está utilizando
    if (typeof eventOrName === 'string') {
      // Formato antiguo: trackEvent(name, metadata)
      name = eventOrName;
      payload = metadata || {};
    } else {
      // Formato nuevo: trackEvent({ name, payload, traceId })
      name = eventOrName.name;
      payload = eventOrName.payload || {};
      traceId = eventOrName.traceId;
    }
    
    // Crear trace
    return await langfuseClient.trace({
      id: traceId,
      name,
      metadata: payload
    });
  } catch (error) {
    console.error('Error al enviar evento a Langfuse:', error);
    return null;
  }
};
