// Interface para metadatos de eventos
interface EventMetadata {
  [key: string]: unknown;
}

// Interface para objetos de eventos de seguimiento
interface TrackEventObject {
  name: string;
  payload?: Record<string, unknown>;
  traceId?: string;
}

/** Verifica que las vars de entorno de Langfuse estén definidas */
export function verifyLangfuseConfig(): void {
  if (!import.meta.env.VITE_LANGFUSE_PUBLIC_KEY) {
    throw new Error('Missing env VITE_LANGFUSE_PUBLIC_KEY');
  }
  if (!import.meta.env.VITE_LANGFUSE_BASE_URL) {
    throw new Error('Missing env VITE_LANGFUSE_BASE_URL');
  }
}

// Mock de Langfuse para desarrollo
const mockTrackEvent = async (nameOrEvent: string | TrackEventObject, data: EventMetadata = {}): Promise<null> => {
  if (typeof nameOrEvent === 'string') {
    console.log('Mock Langfuse Event:', { name: nameOrEvent, ...data });
  } else {
    console.log('Mock Langfuse Event:', { 
      name: nameOrEvent.name, 
      payload: nameOrEvent.payload,
      traceId: nameOrEvent.traceId 
    });
  }
  return null;
};

export const trackEvent = async (nameOrEvent: string | TrackEventObject, data: EventMetadata = {}): Promise<null> => {
  try {
    // En desarrollo, usamos el mock
    return await mockTrackEvent(nameOrEvent, data);
  } catch (error) {
    console.warn('Error al trackear evento:', error);
    return null;
  }
};
