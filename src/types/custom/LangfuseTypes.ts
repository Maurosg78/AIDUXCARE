/**
 * Tipos personalizados para Langfuse
 */

// Opciones para Langfuse
export interface LangfuseOptions {
  publicKey: string;
  secretKey?: string;
  baseUrl?: string;
  host?: string;
  debug?: boolean;
  release?: string;
  project?: string;
  flushAt?: number;
  flushInterval?: number;
}

// Opciones de trazado
export interface TraceOptions {
  name: string;
  metadata?: Record<string, unknown>;
  userId?: string;
  id?: string;
  sessionId?: string;
  tags?: string[];
}

// Opciones de observación
export interface ObservationOptions {
  name: string;
  traceId?: string;
  metadata?: Record<string, unknown>;
  startTime?: Date | string;
  endTime?: Date | string;
  input?: unknown;
  output?: unknown;
}

// Tipo para trazado en Langfuse
export interface LangfuseTrace {
  id: string;
  name: string;
  startTime: string;
  endTime?: string;
  metadata?: {
    patientId?: string;
    visitId?: string;
    userId?: string;
    [key: string]: unknown;
  };
  observations?: LangfuseObservation[];
  tags?: string[];
  userId?: string;
  sessionId?: string;
  version?: string;
}

// Tipo para observación en Langfuse
export interface LangfuseObservation {
  id: string;
  name: string;
  traceId: string;
  startTime: string;
  endTime?: string;
  input?: {
    field?: string;
    feedback?: 'positive' | 'negative' | 'ignored';
    [key: string]: unknown;
  };
  output?: unknown;
  metadata?: {
    patientId?: string;
    visitId?: string;
    userId?: string;
    [key: string]: unknown;
  };
  type?: string;
  level?: 'DEBUG' | 'DEFAULT' | 'WARNING' | 'ERROR';
  statusMessage?: string;
}

// Tipo para generación en Langfuse
export interface LangfuseGeneration extends LangfuseObservation {
  model?: string;
  modelParameters?: Record<string, unknown>;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

// Tipo para span en Langfuse
export interface LangfuseSpan extends LangfuseObservation {
  // Propiedades específicas de span
}

// Opciones para obtener trazados
export interface GetTracesOptions {
  limit?: number;
  offset?: number;
  page?: number;
  userId?: string;
  search?: string;
  startTime?: string;
  endTime?: string;
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
  name?: string;
}

// Opciones para obtener observaciones
export interface GetObservationsOptions {
  limit?: number;
  offset?: number;
  page?: number;
  traceId?: string;
  userId?: string;
  search?: string;
  startTime?: string;
  endTime?: string;
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
  name?: string;
} 