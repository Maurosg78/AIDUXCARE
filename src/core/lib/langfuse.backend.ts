import { Langfuse } from 'langfuse-node';

// Cliente de Langfuse para el backend (con secretKey)
export const langfuseBackend = new Langfuse({
  publicKey: process.env.VITE_LANGFUSE_PUBLIC_KEY!,
  secretKey: process.env.LANGFUSE_SECRET_KEY!,
  baseUrl: process.env.VITE_LANGFUSE_BASE_URL
});

// Configuración para verificar en el backend
export const config = {
  hasSecretKey: !!process.env.LANGFUSE_SECRET_KEY,
  baseUrl: process.env.VITE_LANGFUSE_BASE_URL,
};

// Verifica la configuración del backend
export function verifyBackendConfig() {
  if (!config.hasSecretKey || !config.baseUrl) {
    throw new Error('Missing required Langfuse backend configuration');
  }
}

// Función para enviar eventos desde el backend
export const trackServerEvent = async (name: string, metadata: Record<string, unknown> = {}) => {
  try {
    verifyBackendConfig();
    return langfuseBackend.trace({
      name,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error tracking server event:', error);
    throw error;
  }
}; 