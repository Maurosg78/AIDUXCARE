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

export const langfuseClient = new Langfuse({
  publicKey: LANGFUSE_PUBLIC_KEY || '',
  secretKey: LANGFUSE_SECRET_KEY || '',
  baseUrl: process.env.VITE_LANGFUSE_BASE_URL || 'https://cloud.langfuse.com',
});

export const trackEvent = async (
  name: string,
  data: Record<string, any>,
  traceId?: string
) => {
  try {
    if (!LANGFUSE_PUBLIC_KEY || !LANGFUSE_SECRET_KEY) return;

    const trace = await langfuseClient.trace({
      id: traceId,
      name,
      metadata: {
        patientId: data.patientId
      }
    });

    await trace.span({
      name,
      metadata: data
    });
  } catch (error) {
    console.error('Error tracking event:', error);
  }
}; 