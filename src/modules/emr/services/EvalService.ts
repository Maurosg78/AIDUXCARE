import { Evaluation } from '../types/Evaluation';

export interface PatientEval {
  id: string;
  patientId: string;
  visitDate: string;
  motivo: string;
  observaciones: string;
  diagnostico: string;
  alertas: string[];
  feedback: {
    type: 'omission' | 'suggestion' | 'diagnostic' | 'risk';
    severity: 'info' | 'warning' | 'error';
    message: string;
  }[];
  traceId?: string;
}

export interface EvalFilter {
  feedbackType?: 'alerta' | 'sugerencia' | 'test';
  startDate?: Date;
  endDate?: Date;
}

export class EvalService {
  static async getPatientEvals(patientId: string): Promise<PatientEval[]> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/patients/${patientId}/evaluations`);
      if (!response.ok) {
        throw new Error('Error al obtener evaluaciones');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en getPatientEvals:', error);
      return [];
    }
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
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/evaluations`);
      if (!response.ok) {
        throw new Error('Error al obtener evaluaciones');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en getEvaluations:', error);
      return [];
    }
  }

  static async getEvaluationById(id: string): Promise<Evaluation | null> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/evaluations/${id}`);
      if (!response.ok) {
        throw new Error('Error al obtener evaluación');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en getEvaluationById:', error);
      return null;
    }
  }
}

export default EvalService; 