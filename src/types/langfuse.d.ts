import { Langfuse } from 'langfuse-node';

interface LangfuseTrace {
  id: string;
  name: string;
  startTime: string;
  metadata?: {
    patientId?: string;
    [key: string]: unknown;
  };
  observations?: Array<{
    id: string;
    name: string;
    startTime: string;
    input?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  }>;
}

interface LangfuseSpan {
  name: string;
  input?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  end(): Promise<void>;
}

interface LangfuseObservation {
  id: string;
  name: string;
  startTime: string;
  input?: any;
  metadata?: any;
}

interface LangfuseTraceClient {
  id: string;
  span(params: {
    name: string;
    input?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  }): LangfuseSpan;
}

interface CreateLangfuseTraceBody {
  name: string;
  input?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

interface LangfuseResponse<T> {
  data: T[];
}

interface Langfuse {
  trace(traceId: string | CreateLangfuseTraceBody): LangfuseTraceClient;
  getTrace(traceId: string): Promise<LangfuseTrace>;
  getTraces(params: {
    startTime: string;
    name?: string;
  }): Promise<LangfuseResponse<LangfuseTrace>>;
  getObservations(params: {
    startTime: string;
    name?: string;
  }): Promise<LangfuseResponse<LangfuseObservation>>;
}

declare module 'langfuse-node' {
  export class Langfuse {
    constructor(config: {
      publicKey: string;
      secretKey: string;
      baseUrl?: string;
    });

    trace(traceId: string | CreateLangfuseTraceBody): LangfuseTraceClient;
    getTrace(traceId: string): Promise<LangfuseTrace>;
    getTraces(params: {
      startTime: string;
      name?: string;
    }): Promise<LangfuseResponse<LangfuseTrace>>;
    getObservations(params: {
      startTime: string;
      name?: string;
    }): Promise<LangfuseResponse<LangfuseObservation>>;
  }

  export { LangfuseTrace, LangfuseTraceClient, CreateLangfuseTraceBody, LangfuseObservation };
}

export { Langfuse, LangfuseTrace, LangfuseTraceClient, LangfuseObservation }; 