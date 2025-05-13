/**
 * Adaptador de tipos para Langfuse
 * 
 * Este archivo proporciona interfaces concretas para los tipos de Langfuse,
 * evitando problemas de namespace y proporcionando una interfaz consistente.
 */

// Interfaz básica para observaciones de Langfuse
export interface LangfuseObservation {
  id: string;
  name?: string;
  startTime?: string | Date;
  endTime?: string | Date;
  traceId?: string;
  metadata?: Record<string, unknown>;
  level?: string;
  statusMessage?: string;
  version?: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  [key: string]: unknown;
}

// Interfaz para trazas de Langfuse
export interface LangfuseTrace {
  id: string;
  name?: string;
  userId?: string;
  startTime?: string | Date;
  endTime?: string | Date;
  metadata?: Record<string, unknown>;
  observations?: LangfuseObservation[];
  version?: string;
  tags?: string[];
  [key: string]: unknown;
}

// Opciones para obtener observaciones
export interface GetObservationsOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
  filter?: Record<string, unknown>;
  [key: string]: unknown;
}

// Opciones para obtener trazas
export interface GetTracesOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
  filter?: Record<string, unknown>;
  [key: string]: unknown;
}

// Opciones para crear trazas
export interface TraceOptions {
  name?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  tags?: string[];
  [key: string]: unknown;
}

 