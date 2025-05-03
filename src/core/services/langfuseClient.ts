import { Langfuse } from 'langfuse-node';

const REQUIRED_ENV_VARS = [
  'VITE_LANGFUSE_PUBLIC_KEY',
  'VITE_LANGFUSE_SECRET_KEY',
  'VITE_LANGFUSE_HOST'
];

function checkEnvVars(): boolean {
  const missingVars = REQUIRED_ENV_VARS.filter(varName => !process.env[varName]);
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
  publicKey: process.env.VITE_LANGFUSE_PUBLIC_KEY || '',
  secretKey: process.env.VITE_LANGFUSE_SECRET_KEY || '',
  baseUrl: process.env.VITE_LANGFUSE_HOST || 'https://cloud.langfuse.com'
});

export async function trackEvent(
  name: string,
  metadata: Record<string, string | number | boolean>,
  traceId?: string
): Promise<void> {
  if (!checkEnvVars()) return;

  try {
    await langfuse.trace(traceId || 'default').observation({
      name,
      metadata,
      startTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error al registrar evento en Langfuse:', error);
  }
}

// Función de diagnóstico para verificar conectividad
export async function verifyLangfuseConnection(): Promise<boolean> {
  if (!checkEnvVars()) return false;

  try {
    await trackEvent('diagnostic.ping', {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
    console.log('✅ Langfuse: Conexión verificada correctamente');
    return true;
  } catch (error) {
    console.error('❌ Langfuse: Error de conexión:', error);
    return false;
  }
}

export { langfuse }; 