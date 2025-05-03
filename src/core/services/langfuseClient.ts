import { Langfuse } from 'langfuse';

console.log('🌐 Langfuse ENV:', {
  PUBLIC_KEY: import.meta.env.VITE_LANGFUSE_PUBLIC_KEY,
  SECRET_KEY: import.meta.env.VITE_LANGFUSE_SECRET_KEY,
  BASE_URL:  import.meta.env.VITE_LANGFUSE_BASE_URL,
});

const LANGFUSE_PUBLIC_KEY = import.meta.env.VITE_LANGFUSE_PUBLIC_KEY;
const LANGFUSE_SECRET_KEY = import.meta.env.VITE_LANGFUSE_SECRET_KEY;
const LANGFUSE_BASE_URL = import.meta.env.VITE_LANGFUSE_BASE_URL || 'https://cloud.langfuse.com';

if (!LANGFUSE_PUBLIC_KEY || !LANGFUSE_SECRET_KEY) {
  console.warn('Langfuse keys no encontradas. El tracking estará deshabilitado.');
}

export const langfuse = new Langfuse({
  publicKey: LANGFUSE_PUBLIC_KEY || '',
  secretKey: LANGFUSE_SECRET_KEY || '',
  baseUrl: LANGFUSE_BASE_URL,
});

export function trackEvent(name: string, payload: Record<string, any>, traceId: string) {
  console.log("[Langfuse] Ejecutando trackEvent con:", { name, payload, traceId });

  try {
    // Crea explícitamente el trace si no existe
    const trace = langfuse.trace({ id: traceId });

    // Registra un evento en lugar de un span
    const event = trace.event({
      name,
      input: payload,
      startTime: new Date(),
    });

    console.log("[Langfuse] Evento creado:", event);
    return event;
  } catch (error) {
    console.error("[Langfuse] Error al crear evento:", error);
  }
} 