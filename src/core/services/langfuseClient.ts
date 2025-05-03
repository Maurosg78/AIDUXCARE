import { Langfuse, LangfuseTrace, LangfuseObservation } from 'langfuse-node';
import { TrackEventOptions } from '@/types/events';

interface LangfuseResponse<T> {
  data: T[];
}

const REQUIRED_ENV_VARS = [
  'VITE_LANGFUSE_PUBLIC_KEY',
  'VITE_LANGFUSE_SECRET_KEY',
  'VITE_LANGFUSE_HOST'
];

function checkEnvVars(): boolean {
  const missingVars = REQUIRED_ENV_VARS.filter(varName => !import.meta.env[varName]);
  if (missingVars.length > 0) {
    console.warn(
      `⚠️ Langfuse: Variables de entorno faltantes: ${missingVars.join(', ')}\n` +
      'La trazabilidad estará deshabilitada. Consulta .env.example para más información.'
    );
    return false;
  }
  return true;
}

const langfuse = new Langfuse({
  publicKey: import.meta.env.VITE_LANGFUSE_PUBLIC_KEY,
  secretKey: import.meta.env.VITE_LANGFUSE_SECRET_KEY,
  baseUrl: import.meta.env.VITE_LANGFUSE_HOST,
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
  return langfuse.getTraces({
    startTime,
    name,
  });
};

export const getTrace = async (traceId: string): Promise<LangfuseTrace> => {
  return langfuse.getTrace(traceId);
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
    await trackEvent({
      name: 'diagnostic.ping',
      payload: {
        timestamp: new Date().toISOString(),
        environment: import.meta.env.MODE || 'development'
      },
      traceId: 'default'
    });
    console.log('✅ Langfuse: Conexión verificada correctamente');
    return true;
  } catch (error) {
    console.error('❌ Langfuse: Error de conexión:', error);
    return false;
  }
}

export { langfuse }; 