import { Langfuse } from 'langfuse';
import { LangfuseConfig } from '@/core/types';

// Declaración de tipo para entorno Vite 
declare global {
  interface ImportMetaEnv {
    VITE_LANGFUSE_PUBLIC_KEY: string;
    VITE_LANGFUSE_SECRET_KEY?: string;
    VITE_ENV?: string;
  }
}

// Configuración desde variables de entorno
export const langfuseConfig: LangfuseConfig = {
  publicKey: import.meta.env.VITE_LANGFUSE_PUBLIC_KEY || '',
  secretKey: import.meta.env.VITE_LANGFUSE_SECRET_KEY || '',
  development: import.meta.env.VITE_ENV === 'development',
  project: 'aiduxcare',
};

// Cliente de Langfuse para el frontend
export const langfuseClient: Langfuse | null = (() => {
  try {
    if (langfuseConfig.publicKey) {
      return new Langfuse({
        publicKey: langfuseConfig.publicKey,
        // No usar secretKey en el frontend por seguridad
      });
    }
  } catch (error) {
    console.warn('[AiDuxCare] Error al inicializar Langfuse Client:', error);
  }
  return null;
})();

// Función para verificar la configuración
export const verifyLangfuseConfig = (): boolean => {
  return !!langfuseConfig.publicKey;
};

// Función para crear un mock para pruebas
export function createMockLangfuseClient(): Langfuse {
  const mockTrace = {
    id: 'mock-trace-id',
    update: () => mockTrace,
    end: () => mockTrace,
    getParent: () => null,
    generation: () => ({ id: 'mock-gen-id' }),
    event: () => ({ id: 'mock-event-id' }),
    span: () => mockSpan,
    setUser: () => mockTrace,
  };

  const mockSpan = {
    id: 'mock-span-id',
    update: () => mockSpan,
    end: () => mockSpan,
    getParent: () => mockTrace,
    generation: () => ({ id: 'mock-gen-id' }),
    event: () => ({ id: 'mock-event-id' }),
    span: () => mockSpan,
  };

  return {
    trace: () => mockTrace,
    generation: () => ({ id: 'mock-gen-id' }),
    event: () => ({ id: 'mock-event-id' }),
    span: () => mockSpan,
    setUserId: () => {},
    shutdown: async () => {},
  } as unknown as Langfuse;
}

// Función para validar el entorno del servidor
export const isServerEnvValid = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!import.meta.env.VITE_LANGFUSE_PUBLIC_KEY) {
    errors.push('[AiDuxCare] VITE_LANGFUSE_PUBLIC_KEY no está definido');
  }
  if (!import.meta.env.VITE_LANGFUSE_SECRET_KEY) {
    errors.push('[AiDuxCare] VITE_LANGFUSE_SECRET_KEY no está definido');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Función mock para desarrollo
export const mockLangfuseEvent = (name: string, metadata: Record<string, unknown> = {}) => {
  if (import.meta.env.VITE_ENV === 'development') {
    console.info('[AiDuxCare] Mock Langfuse Event:', { name, ...metadata });
  }
  return Promise.resolve();
}; 