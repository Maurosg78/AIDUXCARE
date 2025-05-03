import { Langfuse } from 'langfuse';

console.log('🌐 Langfuse ENV:', {
  PUBLIC_KEY: import.meta.env.VITE_LANGFUSE_PUBLIC_KEY,
  SECRET_KEY: import.meta.env.VITE_LANGFUSE_SECRET_KEY,
  BASE_URL:  import.meta.env.VITE_LANGFUSE_BASE_URL,
});

const LANGFUSE_PUBLIC_KEY = process.env.VITE_LANGFUSE_PUBLIC_KEY;
const LANGFUSE_SECRET_KEY = process.env.VITE_LANGFUSE_SECRET_KEY;

if (!LANGFUSE_PUBLIC_KEY || !LANGFUSE_SECRET_KEY) {
  console.warn('Langfuse keys no encontradas. El tracking estará deshabilitado.');
}

export const langfuse = new Langfuse({
  publicKey: LANGFUSE_PUBLIC_KEY || '',
  secretKey: LANGFUSE_SECRET_KEY || '',
  baseUrl: process.env.VITE_LANGFUSE_BASE_URL || 'https://cloud.langfuse.com',
});

export function trackEvent(field: string, value: string, traceId: string) {
  console.log("[Langfuse] Ejecutando trackEvent con:", { field, value, traceId });

  // Crea explícitamente el trace si no existe
  const trace = langfuse.trace({ id: traceId });

  // Luego registra un span o evento dentro del trace
  trace.span({
    name: "form.update",
    input: { field, value },
    startTime: new Date(),
  });

  // Alternativamente, puedes usar trace.event si lo prefieres
  // trace.event({ name: "form.update", input: { field, value } });
} 