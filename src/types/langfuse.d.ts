import { Langfuse as LangfuseBase } from 'langfuse';

declare module 'langfuse' {
  interface Langfuse extends LangfuseBase {
    track(event: {name: string; payload?: Record<string, unknown>; traceId?: string}): Promise<{id: string; traceId: string}>;
    getObservations(options: Record<string, unknown>): Promise<{data: Record<string, unknown>[]; totalCount: number}>;
    getTraces(options: Record<string, unknown>): Promise<{data: Record<string, unknown>[]; totalCount: number}>;
    getTrace(traceId: string): Promise<Record<string, unknown>>;
  }
}

declare module 'langfuse-core' {
  interface LangfuseCoreOptions {
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