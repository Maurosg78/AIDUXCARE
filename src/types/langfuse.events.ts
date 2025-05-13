import { z } from './schema-utils';

/**
 * Definiciones de tipo para eventos de Langfuse
 */

// Tipos base para eventos
export interface EventMetadata {
  timestamp: string;
  sessionId?: string;
  userId?: string;
  environment: string;
}

// Esquemas básicos para validación
export const baseEventSchema = z.object({
  timestamp: z.string(),
  sessionId: z.optional(z.string()),
  userId: z.optional(z.string()),
  environment: z.string()
});

// Eventos de formulario
export interface FormEvent {
  formId: string;
  action: 'submit' | 'validate' | 'error';
  fieldCount: number;
  completionTime?: number;
  errorCount?: number;
  timestamp: string;
}

const formEventSchema = z.object({
  formId: z.string(),
  action: z.enumValues(['submit', 'validate', 'error'] as const),
  fieldCount: z.number(),
  completionTime: z.optional(z.number()),
  errorCount: z.optional(z.number()),
  timestamp: z.string()
});

// Eventos de visita
export interface VisitEvent {
  visitId: string;
  patientId: string;
  action: 'create' | 'update' | 'delete' | 'view';
  timestamp: string;
  userId: string;
}

// Eventos de paciente
export interface PatientEvent {
  patientId: string;
  action: 'create' | 'update' | 'delete' | 'view';
  timestamp: string;
  userId: string;
}

// Eventos de AI
export interface AIEvent {
  type: 'suggestion' | 'completion' | 'generation';
  inputTokens: number;
  outputTokens: number;
  model: string;
  duration: number;
  timestamp: string;
  success: boolean;
  error?: string;
}

// Eventos de audio
export type AudioEvent = {
  action: 'start_listening' | 'validate_field' | 'approve_data';
  field?: string;
  value?: string;
  validated?: boolean;
  timestamp: string;
};

const audioEventSchema = z.object({
  action: z.enumValues(['start_listening', 'validate_field', 'approve_data'] as const),
  field: z.optional(z.string()),
  value: z.optional(z.string()),
  validated: z.optional(z.boolean()),
  timestamp: z.string()
});

// Eventos de copiloto
export type CopilotEvent = {
  action: 'generate' | 'feedback' | 'select' | 'reject';
  source?: string;
  field?: string;
  value?: string;
  modelId?: string;
  timestamp: string;
};

const copilotEventSchema = z.object({
  action: z.enumValues(['generate', 'feedback', 'select', 'reject'] as const),
  source: z.optional(z.string()),
  field: z.optional(z.string()),
  value: z.optional(z.string()),
  modelId: z.optional(z.string()),
  timestamp: z.string()
});

// Eventos de administrador
export type AdminEvent = {
  action: 'view_report' | 'export_data' | 'settings_change' | 'user_management';
  userId: string;
  details?: Record<string, unknown>;
  resourceId?: string;
  resourceType?: string;
  result?: 'success' | 'error' | 'warning';
  timestamp: string;
};

const adminEventSchema = z.object({
  action: z.enumValues(['view_report', 'export_data', 'settings_change', 'user_management'] as const),
  userId: z.string(),
  details: z.optional(z.object({})),
  resourceId: z.optional(z.string()),
  resourceType: z.optional(z.string()),
  result: z.optional(z.enumValues(['success', 'error', 'warning'] as const)),
  timestamp: z.string()
});

// Eventos EMR
export type EmrEvent = {
  action: 'create' | 'update' | 'delete' | 'view' | 'search';
  resourceType: 'patient' | 'visit' | 'evaluation' | 'note';
  resourceId: string;
  userId: string;
  details?: Record<string, unknown>;
  metadata?: {
    changeCount?: number;
    responseTime?: number;
    source?: string;
  };
  result?: 'success' | 'error' | 'warning';
  timestamp: string;
};

const emrEventSchema = z.object({
  action: z.enumValues(['create', 'update', 'delete', 'view', 'search'] as const),
  resourceType: z.enumValues(['patient', 'visit', 'evaluation', 'note'] as const),
  resourceId: z.string(),
  userId: z.string(),
  details: z.optional(z.object({})),
  metadata: z.optional(z.object({
    changeCount: z.optional(z.number()),
    responseTime: z.optional(z.number()),
    source: z.optional(z.string())
  })),
  result: z.optional(z.enumValues(['success', 'error', 'warning'] as const)),
  timestamp: z.string()
});

// Tipo unión para todos los eventos
export type LangfuseEvent = 
  | (EventMetadata & FormEvent)
  | (EventMetadata & VisitEvent)
  | (EventMetadata & PatientEvent)
  | (EventMetadata & AIEvent)
  | AudioEvent
  | CopilotEvent
  | AdminEvent
  | EmrEvent;

const LangfuseEventSchema = z.union([
  formEventSchema,
  audioEventSchema,
  copilotEventSchema,
  adminEventSchema,
  emrEventSchema
]);

// Validador general de eventos
export const validateEvent = (event: unknown): LangfuseEvent => {
  // En la versión con tipo estricto, simplemente confiamos en TypeScript
  // y hacemos un cast. En un entorno de producción, podríamos agregar
  // validación runtime más robusta aquí.
  return event as LangfuseEvent;
};

/**
 * Tipos específicos para eventos de Langfuse
 * Estos complementan las definiciones en langfuse.d.ts
 */

// Tipo para la respuesta de observaciones
export interface LangfuseObservationResponse {
  data: LangfuseObservation[];
  totalCount: number;
}

// Tipo para la respuesta de traces
export interface LangfuseTraceResponse {
  data: LangfuseTrace[];
  totalCount: number;
}

// Tipo para una observación de Langfuse
export interface LangfuseObservation {
  id: string;
  name: string;
  traceId: string;
  startTime: string;
  endTime?: string;
  input?: {
    field?: string;
    feedback?: 'positive' | 'negative' | 'ignored';
    [key: string]: any;
  };
  output?: any;
  metadata?: {
    patientId?: string;
    visitId?: string;
    userId?: string;
    [key: string]: any;
  };
  type?: string;
  level?: 'DEBUG' | 'DEFAULT' | 'WARNING' | 'ERROR';
  statusMessage?: string;
}

// Tipo para un trace de Langfuse
export interface LangfuseTrace {
  id: string;
  name: string;
  startTime: string;
  endTime?: string;
  metadata?: {
    patientId?: string;
    visitId?: string;
    userId?: string;
    [key: string]: any;
  };
  observations?: LangfuseObservation[];
  tags?: string[];
  userId?: string;
  sessionId?: string;
  version?: string;
}

// Opciones para obtener traces
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

// Opciones para crear un trace
export interface TraceOptions {
  name: string;
  metadata?: Record<string, any>;
  userId?: string;
  id?: string;
  sessionId?: string;
  tags?: string[];
}

// Tipo para hacer adaptaciones de métodos no incluidos
export interface LangfuseMethods {
  getTraces(options: GetTracesOptions): Promise<LangfuseTraceResponse>;
  getObservations(options: GetObservationsOptions): Promise<LangfuseObservationResponse>;
  trace(options: TraceOptions | string | Record<string, any>): Promise<LangfuseTrace>;
}

// Tipo para parámetros de eventos
export interface EventParams {
  name: string;
  traceId?: string;
  metadata?: Record<string, any>;
  startTime?: Date | string;
  endTime?: Date | string;
  input?: any;
  output?: any;
}

// Tipo para crear un evento
export interface GenerationParams extends EventParams {
  model?: string;
  modelParameters?: Record<string, any>;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

// Helper para tipar objetos de parámetros de eventos
export function createEventParams(params: EventParams): EventParams {
  return params;
}

// Helper para tipar objetos de parámetros de generaciones
export function createGenerationParams(params: GenerationParams): GenerationParams {
  return params;
} 