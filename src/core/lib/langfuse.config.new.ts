import { Langfuse } from 'langfuse';

// Interfaz para la configuración de Langfuse
export interface LangfuseConfig {
  publicKey: string;
  secretKey?: string;
  development?: boolean;
  project?: string;
}

// Configuración desde variables de entorno
export const langfuseConfig: LangfuseConfig = {
  publicKey: process.env.VITE_LANGFUSE_PUBLIC_KEY || '',
  secretKey: process.env.VITE_LANGFUSE_SECRET_KEY || '',
  development: process.env.VITE_ENV === 'development',
  project: 'aiduxcare',
};

// Cliente de Langfuse para el frontend
export let langfuseClient: Langfuse | null = null;

try {
  if (langfuseConfig.publicKey) {
    langfuseClient = new Langfuse({
      publicKey: langfuseConfig.publicKey,
      // No usar secretKey en el frontend por seguridad
    });
  }
} catch (error) {
  console.warn('[AiDuxCare] Error al inicializar Langfuse Client:', error);
}

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