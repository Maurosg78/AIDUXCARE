/**
 * Tipos relacionados con sugerencias del copilot
 */

/**
 * Tipo de sugerencia
 */
export type SuggestionType = 'TEXT' | 'CHECKLIST' | 'DIAGRAM' | 'RECOMMENDATION';

/**
 * Nivel de prioridad
 */
export type PriorityLevel = 'high' | 'medium' | 'low';

/**
 * Estado de la sugerencia
 */
export type SuggestionStatus = 'pending' | 'accepted' | 'rejected';

/**
 * Referencia a PubMed
 */
export interface PubMedReference {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  doi?: string;
  url?: string;
}

/**
 * Representa una sugerencia del copilot
 */
export interface CopilotSuggestion {
  id: string;
  timestamp: string;
  clinicalContextId: string;
  type: SuggestionType;
  content: {
    text?: string;
    items?: string[];
    diagram?: {
      type: string;
      data: unknown;
    };
    recommendation?: {
      title: string;
      description: string;
      priority: PriorityLevel;
    };
  };
  status: SuggestionStatus;
  feedback?: {
    rating: number;
    comment?: string;
    timestamp: string;
  };
  metadata?: {
    traceId?: string;
    model?: string;
    confidence?: number;
    context?: {
      patientId: string;
      visitId?: string;
      evaluationId?: string;
    };
    [key: string]: unknown;
  };
} 