/**
 * Declaraciones de tipos para Langfuse
 * Versión simplificada para evitar conflictos con los tipos de la librería
 */
import type {
  LangfuseOptions,
  TraceOptions,
  GetTracesOptions,
  GetObservationsOptions,
  LangfuseTrace,
  LangfuseObservation
} from './custom/LangfuseTypes';

declare module 'langfuse' {
  // Funciones auxiliares
  export function _track(event: {name: string; payload?: Record<string, unknown>; traceId?: string}): Promise<{id: string; traceId: string}>;
  export function _getObservations(options: GetObservationsOptions): Promise<{data: LangfuseObservation[]; totalCount: number}>;
  export function _getTraces(options: GetTracesOptions): Promise<{data: LangfuseTrace[]; totalCount: number}>;
  export function _getTrace(traceId: string): Promise<LangfuseTrace>;
}

// Módulo core
declare module 'langfuse-core' {
  export interface _LangfuseCoreOptions {
    host?: string;
  }
}

// Mantenemos el export vacío para que TypeScript trate esto como un módulo
export {}; 