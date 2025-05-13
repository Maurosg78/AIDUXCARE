/**
 * Tipos específicos para Langfuse
 * 
 * Este archivo contiene definiciones de tipos para el cliente Langfuse
 * y evita conflictos con declaraciones en otros archivos.
 */

// Re-exportamos tipos de Langfuse necesarios para nuestros componentes
import type {
  Observation as LangfuseObservationBase,
  Trace as LangfuseTraceBase,
  GetTracesParams,
  GetObservationsParams,
  TraceOptions as LangfuseTraceOptions
} from 'langfuse-js';

// Redefinimos y especializamos los tipos para nuestra aplicación
export interface LangfuseObservation extends LangfuseObservationBase {
  metadata?: Record<string, unknown>;
}

export interface LangfuseTrace extends LangfuseTraceBase {
  metadata?: Record<string, unknown>;
}

export type GetTracesOptions = GetTracesParams;
export type GetObservationsOptions = GetObservationsParams;
export type TraceOptions = LangfuseTraceOptions;

// Tipos relacionados con eventos de Langfuse para la aplicación
export interface LangfuseEvent {
  id: string;
  timestamp: string;
  type: string;
  sourceId?: string;
  metadata?: Record<string, unknown>;
  name?: string;
  input?: Record<string, unknown> | string;
  output?: Record<string, unknown> | string;
  startTime?: string;
  endTime?: string;
  userId?: string;
  sessionId?: string;
  tags?: string[];
}

// Tipos para opciones de sugerencias
export interface LangfuseSuggestion {
  id?: string;
  score?: number;
  text: string;
  source?: string;
  confidence?: number;
  metadata?: Record<string, unknown>;
  category?: string;
  language?: string;
  accepted?: boolean;
  rejected?: boolean;
  createdAt?: string;
}

// Tipos específicos para nuestro contexto de integración
export interface LangfuseContext {
  patientId?: string;
  visitId?: string;
  professionalId?: string;
  sessionId?: string;
  requestId?: string;
  traceId?: string;
  metadata?: Record<string, unknown>;
}

// Exportamos valores por defecto para compatibilidad
export const DefaultLangfuseObservation = {} as LangfuseObservation;
export const DefaultLangfuseTrace = {} as LangfuseTrace;

// Exportación por defecto para compatibilidad con importaciones existentes
export default {
  LangfuseObservation: DefaultLangfuseObservation,
  LangfuseTrace: DefaultLangfuseTrace
}; 