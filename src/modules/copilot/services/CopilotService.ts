import type { AdaptedVisit } from '@/types/component-adapters';
import type { SeverityLevel, LegacyCopilotFeedback } from '@/types/copilot/CopilotSuggestion';

/**
 * Interfaz de la visita de paciente con tipos específicos
 * @deprecated Utilizar AdaptedVisit en su lugar
 */
export interface PatientVisit {
  id: string;
  patientId: string;
  visitDate: string;
  status: string;
  notes?: string;
  [key: string]: unknown;
}

/**
 * Tipos de Suggestions soportados
 */
export type SuggestionType = 'alert' | 'recommendation' | 'warning' | 'suggestion';

/**
 * Estructura de una sugerencia del copiloto
 */
export interface Suggestion {
  type: SuggestionType;
  message: string;
  severity?: SeverityLevel;
  field?: string;
  value?: string;
}

/**
 * Servicio para el análisis y generación de sugerencias del Copiloto
 */
export class CopilotService {
  /**
   * Analiza una visita y genera sugerencias clínicas
   * @param visit Datos de la visita a analizar
   * @returns Lista de sugerencias generadas
   */
  static analyzeVisit(visit: PatientVisit | AdaptedVisit): Suggestion[] {
    const suggestions: Suggestion[] = [];

    const visitDate = visit.visitDate || visit.date;
    
    if (!visitDate) {
      suggestions.push({
        type: "alert",
        message: "La visita no tiene una fecha asignada.",
        severity: "warning"
      });
    }

    const notes = visit.notes || '';
    if (!notes || typeof notes === 'string' && notes.length < 10) {
      suggestions.push({
        type: "recommendation",
        message: "Agrega más detalles clínicos en las notas.",
        severity: "info"
      });
    }

    if (visit.status === "scheduled" && visitDate && new Date(visitDate) < new Date()) {
      suggestions.push({
        type: "alert",
        message: "Esta visita estaba programada en el pasado pero sigue marcada como 'scheduled'.",
        severity: "warning"
      });
    }

    return suggestions;
  }
  
  /**
   * Convierte sugerencias al formato de retroalimentación legado
   * @param suggestions Lista de sugerencias
   * @returns Lista de retroalimentación en formato compatible
   */
  static toFeedback(suggestions: Suggestion[]): LegacyCopilotFeedback[] {
    return suggestions.map(suggestion => ({
      ...suggestion,
      severity: suggestion.severity || 'info'
    }));
  }
}

// Exportación predeterminada para compatibilidad con código existente
export default CopilotService;
