import { Langfuse } from 'langfuse';

// Cliente de Langfuse para el frontend (solo publicKey)
export const langfuse = new Langfuse({
  publicKey: import.meta.env.VITE_LANGFUSE_PUBLIC_KEY!,
  baseUrl: import.meta.env.VITE_LANGFUSE_BASE_URL!,
});

// Función de diagnóstico para verificar la configuración
export const verifyLangfuseConfig = () => {
  const config = {
    publicKey: import.meta.env.VITE_LANGFUSE_PUBLIC_KEY?.substring(0, 10) + '...',
    baseUrl: import.meta.env.VITE_LANGFUSE_BASE_URL,
  };

  if (!config.publicKey || !config.baseUrl) {
    console.warn('⚠️ Langfuse Client: Configuración incompleta', config);
    return false;
  }

  console.log('✅ Langfuse Client: Configuración correcta', config);
  return true;
};

// Función para enviar eventos desde el frontend
export const trackEvent = async (name: string, metadata: Record<string, any> = {}) => {
  try {
    const trace = langfuse.trace({
      name,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        environment: import.meta.env.MODE,
      },
    });
    
    await trace.end();
    return true;
  } catch (error) {
    console.error('❌ Langfuse Client: Error al enviar evento', error);
    return false;
  }
}; 