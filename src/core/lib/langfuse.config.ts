import { Langfuse } from 'langfuse';
import type { LangfuseConfig  } from '@/core/types';

// Declaración de tipo para entorno Vite 
declare global {
  interface ImportMetaEnv {
    readonly VITE_LANGFUSE_PUBLIC_KEY?: string;
    readonly VITE_LANGFUSE_SECRET_KEY?: string;
    readonly VITE_ENV?: 'development' | 'production' | 'test';
    readonly VITE_LANGFUSE_BASE_URL?: string;
  }
}

/**
 * Configuración para la integración con Langfuse
 */

// Configuración básica para Langfuse
export const langfuseConfig = {
  publicKey: import.meta.env.VITE_LANGFUSE_PUBLIC_KEY as string | undefined,
  secretKey: import.meta.env.VITE_LANGFUSE_SECRET_KEY as string | undefined,
  baseUrl: import.meta.env.VITE_LANGFUSE_BASE_URL as string | undefined,
  environment: import.meta.env.VITE_ENV as 'development' | 'production' | 'test' | undefined || 'development'
};

// Detección de ambiente de desarrollo
export const isDevelopment = import.meta.env.DEV;

// Verificar que tenemos las credenciales necesarias
export const hasCredentials = Boolean(langfuseConfig.publicKey) && Boolean(langfuseConfig.secretKey);

// Funciones de utilidad
export function isConfigured(): boolean {
  return hasCredentials;
}

// Obtenemos el proyecto actual
export function getProject(): string {
  return 'aiduxcare-client';
}

// Obtenemos el ambiente actual
export function getEnvironment(): string {
  return langfuseConfig.environment;
}

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