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
      baseUrl: process.env.LANGFUSE_BASE_URL
    });
  }
} catch (error) {
  console.warn('Error al inicializar Langfuse:', error);
}

export const trackEvent = async (event: any) => {
  if (!langfuseClient) {
    console.log('Langfuse no está configurado, ignorando evento:', event);
    return null;
  }

  try {
    return await langfuseClient.track(event);
  } catch (error) {
    console.error('Error al trackear evento en Langfuse:', error);
    return null;
  }
}; 