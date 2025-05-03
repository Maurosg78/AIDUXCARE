import { Langfuse, LangfuseTrace, LangfuseObservation } from 'langfuse-node';
import { TrackEventOptions } from '@/types/events';

interface LangfuseResponse<T> {
  data: T[];
}

const checkEnvVars = () => {
  const requiredVars = [
    'VITE_LANGFUSE_PUBLIC_KEY',
    'VITE_LANGFUSE_SECRET_KEY',
    'VITE_LANGFUSE_BASE_URL'
  ];

  const missingVars = requiredVars.filter(
    (varName) => !import.meta.env[varName]
  );

  if (missingVars.length > 0) {
    console.error('Missing required Langfuse environment variables:', missingVars);
    return false;
  }
  return true;
};

const langfuse = new Langfuse({
  publicKey: import.meta.env.VITE_LANGFUSE_PUBLIC_KEY,
  secretKey: import.meta.env.VITE_LANGFUSE_SECRET_KEY,
  baseUrl: import.meta.env.VITE_LANGFUSE_BASE_URL,
});

export const trackEvent = async ({ name, payload, traceId }: TrackEventOptions) => {
  if (!checkEnvVars()) return;

  try {
    const trace = langfuse.trace({
      name: traceId || 'default',
      metadata: payload,
    });

    await trace.createObservation({
      name,
      input: payload,
      metadata: {
        ...payload,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error tracking event:', error);
  }
};

export const getTraces = async (startTime: string, name?: string): Promise<LangfuseResponse<LangfuseTrace>> => {
  if (!checkEnvVars()) return { data: [] };

  try {
    const response = await langfuse.getTraces({
      startTime,
      name,
    });
    return response;
  } catch (error) {
    console.error('Error getting traces:', error);
    return { data: [] };
  }
};

export const getTrace = async (traceId: string): Promise<LangfuseTrace | null> => {
  if (!checkEnvVars()) return null;

  try {
    return await langfuse.getTrace(traceId);
  } catch (error) {
    console.error('Error getting trace:', error);
    return null;
  }
};

export const getObservations = async (startTime: string, name?: string): Promise<LangfuseResponse<LangfuseObservation>> => {
  return langfuse.getObservations({
    startTime,
    name,
  });
};

// Función de diagnóstico para verificar conectividad
export async function verifyLangfuseConnection(): Promise<boolean> {
  if (!checkEnvVars()) return false;

  try {
    const trace = langfuse.trace({
      name: 'diagnostic.ping',
      metadata: {
        timestamp: new Date().toISOString(),
        environment: import.meta.env.MODE || 'development'
      }
    });

    await trace.createObservation({
      name: 'ping',
      input: { timestamp: new Date().toISOString() }
    });

    console.log('✅ Langfuse: Conexión verificada correctamente');
    return true;
  } catch (error) {
    console.error('❌ Langfuse: Error de conexión:', error);
    return false;
  }
}

export { langfuse }; 