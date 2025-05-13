/**
 * Barrel file central para adaptadores de componentes
 * 
 * Este archivo centraliza la exportación de todas las interfaces adaptadoras
 * para componentes, facilitando la importación y reduciendo problemas de namespace.
 */

// Re-exportar todas las interfaces adaptadoras
export type {
  AdaptedVisit,
  AdaptedPatient,
  AdaptedClinicalEvaluation,
  AdaptedPatientEval
} from '../component-adapters';

// Re-exportar tipos actualizados para componentes
export type {
  Visit,
  Patient,
  ClinicalEvaluation,
  PatientEval,
  VisitData,
  PatientData,
  ClinicalEvaluationData,
  PatientEvalData,
  CopilotSuggestion
} from '../component-types';

// Exportar tipos para router
export type { LinkProps, NavigateProps } from '../react-router';
export type { RouteObject } from '@/core/utils/router'; 