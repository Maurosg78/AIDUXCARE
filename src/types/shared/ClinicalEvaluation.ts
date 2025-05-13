/**
 * Tipos relacionados con evaluaciones clínicas
 */
import type { AuditLogEntry } from './AuditLogEntry';
import type { Patient } from './Patient';
import type { Visit } from './Visit';

/**
 * Estado de una evaluación clínica
 */
export type EvaluationStatus = 'draft' | 'in_progress' | 'completed' | 'cancelled';

/**
 * Sección de evaluación clínica con valores dinámicos
 */
export interface EvaluationSection {
  value: string | number | boolean | null;
  notes?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Representa una evaluación clínica
 */
export interface ClinicalEvaluation {
  id: string;
  patientId: string;
  patient?: Patient;
  visitId: string;
  visit?: Visit;
  date: string;
  status: EvaluationStatus;
  sections: Record<string, EvaluationSection>;
  diagnosis?: string[];
  treatment?: string[];
  followUp?: {
    date?: string;
    notes?: string;
  };
  audit: AuditLogEntry[];
  metadata?: {
    traceId?: string;
    version?: string;
    lastModified?: string;
    [key: string]: unknown;
  };
  createdAt: string;
  updatedAt: string;
} 