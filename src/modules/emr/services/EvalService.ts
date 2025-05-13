// Interface compartida definida en el proyecto
interface CommonPatientEval {
  patientId: string;
  traceId: string;
  motivo?: string;
  diagnosticoFisioterapeutico?: string;
  tratamientoPropuesto?: string;
}
import { z } from '@/types/schema-utils';
import type { Evaluation } from '../types/Evaluation';
import { generateId } from '@/utils/id';

// Definición de la interfaz PatientEval para este servicio
export interface PatientEval {
  // Campos requeridos
  id: string;
  patientId: string;
  // Campos opcionales
  traceId?: string;
  visitId?: string;
  anamnesis?: string;
  physicalExam?: string;
  diagnosis?: string;
  treatment?: string;
  observations?: string;
  voiceApprovedNotes?: string[];
  createdAt?: string;
  updatedAt?: string;
  motivo?: string;
  diagnosticoFisioterapeutico?: string;
  tratamientoPropuesto?: string;
  alertas?: string[];
  [key: string]: unknown;
}

// Esquema de validación para feedback
const FeedbackSchema = z.object({
  type: z.enumValues(['omission', 'suggestion', 'diagnostic', 'risk'] as const),
  severity: z.enumValues(['info', 'warning', 'error'] as const),
  message: z.string()
});

// Definir el esquema para PatientEval
const PatientEvalSchema = z.object({
  id: z.string(),
  visitId: z.string(),
  patientId: z.string(),
  anamnesis: z.optional(z.string()),
  physicalExam: z.optional(z.string()),
  diagnosis: z.optional(z.string()),
  treatment: z.optional(z.string()),
  observations: z.optional(z.string()),
  voiceApprovedNotes: z.optional(z.array(z.string())),
  createdAt: z.optional(z.string()),
  updatedAt: z.optional(z.string()),
  diagnosticoFisioterapeutico: z.optional(z.string()),
  tratamientoPropuesto: z.optional(z.string()),
  motivo: z.optional(z.string()),
  alertas: z.optional(z.array(z.string())),
  traceId: z.optional(z.string())
});

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
  startDate?: Date;
  endDate?: Date;
  diagnosisText?: string;
  feedbackType?: 'alerta' | 'sugerencia' | 'test';
}

/**
 * Servicio para gestionar evaluaciones de pacientes
 */
export class EvalService {
  // Almacenamiento de evaluaciones
  private static evaluations: PatientEval[] = [];

  /**
   * Crear una nueva evaluación
   */
  async create(evalData: { patientId: string; visitId: string } & Omit<Partial<PatientEval>, 'id' | 'createdAt' | 'updatedAt' | 'patientId' | 'visitId'>): Promise<PatientEval> {
    try {
      const { patientId, visitId, ...restData } = evalData;
      const newEval: PatientEval = {
        id: generateId(),
        patientId,
        visitId,
        ...restData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Almacenar en la colección
      EvalService.evaluations.push(newEval);
      return newEval;
    } catch (error) {
      console.error('Error creando evaluación:', error);
      throw error;
    }
  }

  /**
   * Obtener una evaluación por ID
   */
  async getById(evalId: string): Promise<PatientEval | null> {
    try {
      const foundEval = EvalService.evaluations.find(e => e.id === evalId);
      return foundEval || null;
    } catch (error) {
      console.error('Error obteniendo evaluación:', error);
      return null;
    }
  }

  /**
   * Actualizar una evaluación existente
   */
  async update(evalId: string, evalData: Partial<PatientEval>): Promise<PatientEval> {
    const evalIndex = EvalService.evaluations.findIndex(e => e.id === evalId);
    if (evalIndex === -1) {
      throw new Error('Evaluación no encontrada');
    }
    
    const updatedEval = {
      ...EvalService.evaluations[evalIndex],
      ...evalData,
      updatedAt: new Date().toISOString()
    } as PatientEval;
    
    // Actualizar
    EvalService.evaluations[evalIndex] = updatedEval;
    return updatedEval;
  }

  /**
   * Eliminar una evaluación
   */
  async delete(evalId: string): Promise<void> {
    const evalIndex = EvalService.evaluations.findIndex(e => e.id === evalId);
    if (evalIndex === -1) {
      throw new Error('Evaluación no encontrada');
    }
    
    EvalService.evaluations.splice(evalIndex, 1);
  }

  /**
   * Obtener evaluaciones por visita
   */
  async getByVisitId(visitId: string): Promise<PatientEval[]> {
    return EvalService.evaluations.filter(e => e.visitId === visitId);
  }

  /**
   * Obtener evaluaciones por paciente
   */
  static async getPatientEvals(patientId: string): Promise<PatientEval[]> {
    try {
      // Filtrar por paciente
      return this.evaluations.filter(item => item.patientId === patientId);
    } catch (error) {
      console.error('Error obteniendo evaluaciones:', error);
      return [];
    }
  }

  /**
   * Filtrar evaluaciones según criterios
   */
  static async filterEvals(evals: PatientEval[], filters: EvalFilter): Promise<PatientEval[]> {
    return evals.filter(evaluation => {
      // Filtro por fecha inicio
      if (filters.startDate && evaluation.createdAt && new Date(evaluation.createdAt) < filters.startDate) {
        return false;
      }
      
      // Filtro por fecha fin
      if (filters.endDate && evaluation.createdAt && new Date(evaluation.createdAt) > filters.endDate) {
        return false;
      }
      
      // Filtro por texto en diagnóstico
      if (filters.diagnosisText && evaluation.diagnosis) {
        const matchesDiagnosis = evaluation.diagnosis.toLowerCase().includes(
          filters.diagnosisText.toLowerCase()
        );
        if (!matchesDiagnosis) return false;
      }
      
      // Filtro por tipo de feedback
      if (filters.feedbackType) {
        // Implementar lógica según necesidad del proyecto
      }
      
      return true;
    });
  }

  /**
   * Obtener todas las evaluaciones
   */
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

  /**
   * Obtener una evaluación específica por ID
   */
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