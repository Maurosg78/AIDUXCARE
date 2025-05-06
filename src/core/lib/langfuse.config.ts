import { Langfuse } from 'langfuse';
import { Langfuse as LangfuseNode } from 'langfuse-node';

// Interfaz para la configuración
interface LangfuseConfig {
  publicKey: string;
  secretKey: string;
  baseUrl: string;
}

// Función para validar el entorno del servidor
export const isServerEnvValid = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!process.env.VITE_LANGFUSE_PUBLIC_KEY) {
    errors.push('[AiDuxCare] VITE_LANGFUSE_PUBLIC_KEY no está definido');
  }
  if (!process.env.VITE_LANGFUSE_SECRET_KEY) {
    errors.push('[AiDuxCare] VITE_LANGFUSE_SECRET_KEY no está definido');
  }
  if (!process.env.VITE_LANGFUSE_BASE_URL) {
    errors.push('[AiDuxCare] VITE_LANGFUSE_BASE_URL no está definido');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Función para obtener la configuración según el entorno
const getConfig = (): LangfuseConfig => {
  const isDev = process.env.NODE_ENV === 'development';
  
  // En el servidor
  if (typeof process !== 'undefined' && process.env) {
    const config = {
      publicKey: process.env.VITE_LANGFUSE_PUBLIC_KEY || '',
      secretKey: process.env.VITE_LANGFUSE_SECRET_KEY || '',
      baseUrl: process.env.VITE_LANGFUSE_BASE_URL || 'https://cloud.langfuse.com'
    };

    // En desarrollo, permitimos configuración mock
    if (isDev && (!config.publicKey || !config.secretKey)) {
      console.warn('[AiDuxCare] Usando configuración mock de Langfuse para desarrollo');
      return {
        publicKey: 'pk-lf-mock',
        secretKey: 'sk-lf-mock',
        baseUrl: 'https://cloud.langfuse.com'
      };
    }

    return config;
  }
  
  // En el cliente (browser)
  return {
    publicKey: import.meta.env?.VITE_LANGFUSE_PUBLIC_KEY || '',
    secretKey: import.meta.env?.VITE_LANGFUSE_SECRET_KEY || '',
    baseUrl: import.meta.env?.VITE_LANGFUSE_BASE_URL || 'https://cloud.langfuse.com'
  };
};

// Configuración común
const config = getConfig();
const isDev = process.env.NODE_ENV === 'development';

// Cliente para el frontend (solo publicKey)
let langfuseClient: Langfuse | null = null;
try {
  langfuseClient = new Langfuse({
    publicKey: config.publicKey,
    baseUrl: config.baseUrl
  });
} catch (error) {
  console.warn('[AiDuxCare] Error al inicializar Langfuse Client:', error);
}

// Cliente para el backend (con secretKey)
let langfuseServer: LangfuseNode | null = null;
try {
  if (config.secretKey && config.publicKey) {
    langfuseServer = new LangfuseNode({
      secretKey: config.secretKey,
      publicKey: config.publicKey,
      baseUrl: config.baseUrl
    });
  } else if (!isDev) {
    throw new Error(
      '[AiDuxCare] Claves de Langfuse no configuradas. ' +
      'Asegúrate de que .env.local esté presente y contenga:\n' +
      '- VITE_LANGFUSE_PUBLIC_KEY\n' +
      '- VITE_LANGFUSE_SECRET_KEY\n' +
      '- VITE_LANGFUSE_BASE_URL'
    );
  }
} catch (error) {
  console.error('[AiDuxCare] Error al inicializar Langfuse Server:', error);
}

// Función mock para desarrollo
export const mockLangfuseEvent = (name: string, metadata: Record<string, unknown> = {}) => {
  if (isDev) {
    console.info('[AiDuxCare] Mock Langfuse Event:', { name, ...metadata });
  }
  return Promise.resolve();
};

export { langfuseClient, langfuseServer }; 