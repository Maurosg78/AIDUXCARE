import { Langfuse as LangfuseBase } from 'langfuse';
import type {
  LangfuseOptions,
  TraceOptions,
  ObservationOptions,
  GetTracesOptions,
  GetObservationsOptions,
  LangfuseTrace,
  LangfuseObservation,
  LangfuseGeneration,
  LangfuseSpan
} from './custom/LangfuseTypes';

declare module 'langfuse' {
  interface Langfuse extends LangfuseBase {
    track(event: {name: string; payload?: Record<string, unknown>; traceId?: string}): Promise<{id: string; traceId: string}>;
    getObservations(options: GetObservationsOptions): Promise<{data: LangfuseObservation[]; totalCount: number}>;
    getTraces(options: GetTracesOptions): Promise<{data: LangfuseTrace[]; totalCount: number}>;
    getTrace(traceId: string): Promise<LangfuseTrace>;
  }

  export function track(event: {name: string; payload?: Record<string, unknown>; traceId?: string}): Promise<{id: string; traceId: string}>;
  export function getObservations(options: GetObservationsOptions): Promise<{data: LangfuseObservation[]; totalCount: number}>;
  export function getTraces(options: GetTracesOptions): Promise<{data: LangfuseTrace[]; totalCount: number}>;
  export function getTrace(traceId: string): Promise<LangfuseTrace>;

  export class _LangfuseClient {
    constructor(options: LangfuseOptions);
    trace(options: TraceOptions | string): Promise<LangfuseTrace>;
    getTraces(options?: GetTracesOptions): Promise<{ data: LangfuseTrace[]; hasMore: boolean }>;
    getObservations(options?: GetObservationsOptions): Promise<{ data: LangfuseObservation[]; hasMore: boolean }>;
  }

  // Funciones auxiliares
  export function _track(event: {name: string; payload?: Record<string, unknown>; traceId?: string}): Promise<{id: string; traceId: string}>;
  export function _getObservations(options: GetObservationsOptions): Promise<{data: LangfuseObservation[]; totalCount: number}>;
  export function _getTraces(options: GetTracesOptions): Promise<{data: LangfuseTrace[]; totalCount: number}>;
  export function _getTrace(traceId: string): Promise<LangfuseTrace>;
}

declare module 'langfuse-core' {
  interface LangfuseCoreOptions {
    host?: string;
  }

  export interface _LangfuseCoreOptions {
    host?: string;
  }
}

// Declaración para langfuse-node
declare module 'langfuse-node' {
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

  export class Langfuse {
    constructor(options: LangfuseOptions);
    
    trace(name: string, metadata?: Record<string, unknown>, userId?: string, tags?: string[]): LangfuseTrace;
    
    generation(params: {
      name: string;
      traceId?: string;
      startTime?: Date;
      endTime?: Date;
      metadata?: Record<string, unknown>;
      input?: string | Record<string, unknown>;
      output?: string | Record<string, unknown>;
      model?: string;
      modelParameters?: Record<string, unknown>;
      usage?: {
        promptTokens?: number;
        completionTokens?: number;
        totalTokens?: number;
      };
    }): LangfuseGeneration;
    
    event(params: {
      name: string;
      traceId?: string;
      startTime?: Date;
      endTime?: Date;
      metadata?: Record<string, unknown>;
      input?: string | Record<string, unknown>;
      output?: string | Record<string, unknown>;
    }): void;
    
    span(params: {
      name: string;
      traceId?: string;
      startTime?: Date;
      endTime?: Date;
      metadata?: Record<string, unknown>;
      input?: string | Record<string, unknown>;
      output?: string | Record<string, unknown>;
    }): LangfuseSpan;
    
    score(params: {
      name: string;
      traceId?: string;
      value: number;
      comment?: string;
    }): void;
    
    flush(): Promise<void>;
  }

  export class LangfuseTrace {
    id: string;
    
    constructor(id: string, langfuse: Langfuse);
    
    generation(params: {
      name: string;
      startTime?: Date;
      endTime?: Date;
      metadata?: Record<string, unknown>;
      input?: string | Record<string, unknown>;
      output?: string | Record<string, unknown>;
      model?: string;
      modelParameters?: Record<string, unknown>;
      usage?: {
        promptTokens?: number;
        completionTokens?: number;
        totalTokens?: number;
      };
    }): LangfuseGeneration;
    
    event(params: {
      name: string;
      startTime?: Date;
      endTime?: Date;
      metadata?: Record<string, unknown>;
      input?: string | Record<string, unknown>;
      output?: string | Record<string, unknown>;
    }): void;
    
    span(params: {
      name: string;
      startTime?: Date;
      endTime?: Date;
      metadata?: Record<string, unknown>;
      input?: string | Record<string, unknown>;
      output?: string | Record<string, unknown>;
    }): LangfuseSpan;
    
    score(params: {
      name: string;
      value: number;
      comment?: string;
    }): void;
    
    update(params: {
      name?: string;
      userId?: string;
      metadata?: Record<string, unknown>;
      tags?: string[];
      public?: boolean;
    }): void;
  }

  export class LangfuseGeneration {
    id: string;
  }

  export class LangfuseSpan {
    id: string;
  }
}

// Mantenemos el export vacío para que TypeScript trate esto como un módulo
export {};