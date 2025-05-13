/**
 * Tipos relacionados con sugerencias del copilot
 */

/**
 * Tipo de sugerencia
 */
export type SuggestionType = 'TEXT' | 'CHECKLIST' | 'DIAGRAM' | 'RECOMMENDATION' | 'ALERT';

/**
 * Nivel de prioridad
 */
export type PriorityLevel = 'high' | 'medium' | 'low';

/**
 * Estado de la sugerencia
 */
export type SuggestionStatus = 'pending' | 'accepted' | 'rejected';

/**
 * Nivel de severidad para alertas y recomendaciones
 */
export type SeverityLevel = 'critical' | 'warning' | 'info';

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
 * Datos del diagrama
 */
export interface DiagramData {
  type: string;
  format: string;
  content: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

/**
 * Datos de recomendación
 */
export interface RecommendationData {
  title: string;
  description: string;
  priority: PriorityLevel;
  references?: PubMedReference[];
}

/**
 * Contexto del contenido clínico
 */
export interface ClinicalContext {
  patientId: string;
  visitId?: string;
  evaluationId?: string;
  professionalId?: string;
  timestamp?: string;
}

/**
 * Feedback del usuario sobre la sugerencia
 */
export interface SuggestionFeedback {
  rating: number;
  comment?: string;
  timestamp: string;
  userId?: string;
}

/**
 * Metadatos de la sugerencia
 */
export interface CopilotSuggestionMetadata {
  traceId?: string;
  model?: string;
  confidence?: number;
  context?: ClinicalContext;
  source?: 'voice' | 'text' | 'structured' | 'mcp';
  [key: string]: unknown;
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
    diagram?: DiagramData;
    recommendation?: RecommendationData;
    alert?: {
      message: string;
      severity: SeverityLevel;
    };
  };
  status: SuggestionStatus;
  feedback?: SuggestionFeedback;
  metadata?: CopilotSuggestionMetadata;
}

/**
 * Tipo para compatibilidad con el sistema antiguo
 */
export interface LegacyCopilotFeedback {
  type: 'suggestion' | 'alert' | 'warning' | 'recommendation';
  message: string;
  severity: SeverityLevel;
  field?: string;
  value?: string;
} 