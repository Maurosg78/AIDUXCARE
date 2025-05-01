import fs from 'fs';
import path from 'path';

export interface PatientEval {
  patientId: string;
  visitDate: string;
  motivo: string;
  observaciones: string;
  exploracionFisica: {
    inspeccion: string;
    movilidad: string;
    hallazgos: string[];
  };
  escalasUtilizadas: string[];
  diagnostico: string;
  plan: string;
  alertas: string[];
  traceId?: string;
}

export interface EvalFilter {
  startDate?: Date;
  endDate?: Date;
  feedbackType?: 'alerta' | 'sugerencia' | 'test';
}

class EvalService {
  private static API_URL = import.meta.env.VITE_API_BASE_URL || '';

  static async getPatientEvals(patientId: string): Promise<PatientEval[]> {
    try {
      // En producción, esto debería hacer una llamada a la API
      // Por ahora, retornamos datos de ejemplo
      return [{
        patientId,
        visitDate: new Date().toISOString(),
        motivo: "Ejemplo",
        observaciones: "Datos de ejemplo",
        exploracionFisica: {
          inspeccion: "Normal",
          movilidad: "Normal",
          hallazgos: []
        },
        escalasUtilizadas: [],
        diagnostico: "En evaluación",
        plan: "Seguimiento",
        alertas: [],
        traceId: "trace_example_001"
      }];
    } catch (error) {
      console.error('Error loading patient evals:', error);
      return [];
    }
  }

  static async getAllEvals(): Promise<PatientEval[]> {
    try {
      // En producción, esto debería hacer una llamada a la API
      // Por ahora, retornamos un array vacío
      return [];
    } catch (error) {
      console.error('Error loading all evals:', error);
      return [];
    }
  }

  static async filterEvals(evaluations: PatientEval[], filters: EvalFilter): Promise<PatientEval[]> {
    return evaluations.filter(evaluation => {
      const evalDate = new Date(evaluation.visitDate);
      
      // Filtro por rango de fechas
      if (filters.startDate && evalDate < filters.startDate) return false;
      if (filters.endDate && evalDate > filters.endDate) return false;

      // Filtro por tipo de feedback
      if (filters.feedbackType) {
        switch (filters.feedbackType) {
          case 'alerta':
            return evaluation.alertas.length > 0;
          case 'sugerencia':
            return evaluation.plan.toLowerCase().includes('sugerencia');
          case 'test':
            return evaluation.escalasUtilizadas.length > 0;
          default:
            return true;
        }
      }

      return true;
    });
  }
}

export default EvalService; 