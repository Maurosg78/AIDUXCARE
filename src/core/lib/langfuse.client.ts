import { Langfuse } from 'langfuse';
import type { EventMetadata, EventResponse } from '../types/langfuse.events';

interface EventMetadata {
  [key: string]: unknown;
}

interface EventResponse {
  success: boolean;
  traceId?: string;
  error?: string;
}

/** Verifica que las vars de entorno de Langfuse estén definidas */
export function verifyLangfuseConfig() {
  if (!import.meta.env.VITE_LANGFUSE_PUBLIC_KEY) {
    throw new Error('Missing env VITE_LANGFUSE_PUBLIC_KEY');
  }
  if (!import.meta.env.VITE_LANGFUSE_BASE_URL) {
    throw new Error('Missing env VITE_LANGFUSE_BASE_URL');
  }
}

// Mock de Langfuse para desarrollo
const mockTrackEvent = async (name: string, data: any = {}) => {
  console.log('Mock Langfuse Event:', { name, ...data });
  return null;
};

export const trackEvent = async (name: string, data: any = {}) => {
  try {
    // En desarrollo, usamos el mock
    return await mockTrackEvent(name, data);
  } catch (error) {
    console.warn('Error al trackear evento:', error);
    return null;
  }
};
