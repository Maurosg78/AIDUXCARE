import { z } from 'zod';
import { Evaluation } from '../types/Evaluation';

// Esquema de validación para feedback
const FeedbackSchema = z.object({
  type: z.enum(['omission', 'suggestion', 'diagnostic', 'risk']),
  severity: z.enum(['info', 'warning', 'error']),
  message: z.string()
});

// Esquema de validación para evaluación de paciente
const PatientEvalSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  visitDate: z.string(),
  motivo: z.string(),
  observaciones: z.string(),
  diagnostico: z.string(),
  alertas: z.array(z.string()),
  feedback: z.array(FeedbackSchema),
  traceId: z.string().optional()
});

export type PatientEval = z.infer<typeof PatientEvalSchema>;

// Clase personalizada para errores de evaluación
export class EvalServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'EvalServiceError';
  }
}

// Función auxiliar para retry con backoff exponencial
const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts) break;
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

// Función auxiliar para validar y parsear respuesta JSON
const parseJSONResponse = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get('content-type');
  
  if (!contentType?.includes('application/json')) {
    const text = await response.text();
    throw new EvalServiceError(
      'Respuesta no válida: Se esperaba JSON',
      'INVALID_CONTENT_TYPE',
      { contentType, responseText: text }
    );
  }

  try {
    return await response.json();
  } catch (error) {
    throw new EvalServiceError(
      'Error al parsear respuesta JSON',
      'PARSE_ERROR',
      error
    );
  }
};

export interface EvalFilter {
  feedbackType?: 'alerta' | 'sugerencia' | 'test';
  startDate?: Date;
  endDate?: Date;
}

export class EvalService {
  static async getPatientEvals(patientId: string): Promise<PatientEval[]> {
    return retry(async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/patients/${patientId}/evaluations`
        );

        if (!response.ok) {
          throw new EvalServiceError(
            `Error HTTP: ${response.status} ${response.statusText}`,
            'HTTP_ERROR',
            { status: response.status }
          );
        }

        const data = await parseJSONResponse(response);
        
        // Validar estructura de datos con Zod
        const result = z.array(PatientEvalSchema).safeParse(data);
        
        if (!result.success) {
          throw new EvalServiceError(
            'Datos de evaluación inválidos',
            'VALIDATION_ERROR',
            result.error
          );
        }

        return result.data;
      } catch (error) {
        if (error instanceof EvalServiceError) {
          throw error;
        }
        throw new EvalServiceError(
          'Error al obtener evaluaciones del paciente',
          'UNKNOWN_ERROR',
          error
        );
      }
    });
  }

  static async filterEvals(evals: PatientEval[], filters: EvalFilter): Promise<PatientEval[]> {
    return evals.filter(evaluation => {
      if (filters.feedbackType) {
        // Implementar filtrado por tipo
        return true;
      }
      if (filters.startDate && new Date(evaluation.visitDate) < filters.startDate) {
        return false;
      }
      if (filters.endDate && new Date(evaluation.visitDate) > filters.endDate) {
        return false;
      }
      return true;
    });
  }

  static async getEvaluations(): Promise<Evaluation[]> {
    return retry(async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/evaluations`);
        
        if (!response.ok) {
          throw new EvalServiceError(
            `Error HTTP: ${response.status} ${response.statusText}`,
            'HTTP_ERROR',
            { status: response.status }
          );
        }

        const data = await parseJSONResponse(response);
        return data as Evaluation[];
      } catch (error) {
        if (error instanceof EvalServiceError) {
          throw error;
        }
        throw new EvalServiceError(
          'Error al obtener evaluaciones',
          'UNKNOWN_ERROR',
          error
        );
      }
    });
  }

  static async getEvaluationById(id: string): Promise<Evaluation | null> {
    return retry(async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/evaluations/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          throw new EvalServiceError(
            `Error HTTP: ${response.status} ${response.statusText}`,
            'HTTP_ERROR',
            { status: response.status }
          );
        }

        const data = await parseJSONResponse(response);
        return data as Evaluation;
      } catch (error) {
        if (error instanceof EvalServiceError) {
          throw error;
        }
        throw new EvalServiceError(
          'Error al obtener evaluación por ID',
          'UNKNOWN_ERROR',
          error
        );
      }
    });
  }
}

export default EvalService; 