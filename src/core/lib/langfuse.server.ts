import { Langfuse } from 'langfuse-node';

const isLangfuseConfigured = () => {
  return process.env.LANGFUSE_SECRET_KEY && process.env.LANGFUSE_PUBLIC_KEY;
};

let langfuseClient: Langfuse | null = null;

try {
  if (isLangfuseConfigured()) {
    langfuseClient = new Langfuse({
      secretKey: process.env.LANGFUSE_SECRET_KEY!,
      publicKey: process.env.LANGFUSE_PUBLIC_KEY!,
    });
  }
} catch (error) {
  console.warn('Error al inicializar Langfuse:', error);
}

// Definimos la estructura de los eventos que vamos a trackear
export interface TrackEventParams {
  name: string;
  payload?: Record<string, unknown>;
  traceId?: string;
}

export const trackEvent = async (event: TrackEventParams) => {
  if (!langfuseClient) {
    console.log('Langfuse no está configurado, ignorando evento:', event);
    return null;
  }

  try {
    // Usamos la API de Langfuse con nombre y metadatos
    return await langfuseClient.trace(event.name, {
      metadata: event.payload,
      id: event.traceId
    });
  } catch (error) {
    console.error('Error al trackear evento en Langfuse:', error);
    return null;
  }
}; 