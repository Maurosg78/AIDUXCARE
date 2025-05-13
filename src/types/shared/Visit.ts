/**
 * Tipos relacionados con visitas
 */
import type { Patient } from './Patient';

/**
 * Tipo de visita
 */
export type VisitType = 'initial' | 'followup' | 'emergency' | 'routine';

/**
 * Estado de la visita
 */
export type VisitStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

/**
 * Referencia básica a un paciente para evitar referencias circulares
 */
export interface PatientReference {
  id: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Representa una visita médica
 */
export interface Visit {
  id: string;
  patientId: string;
  patient?: PatientReference;
  date: string;
  type: VisitType;
  status: VisitStatus;
  notes?: string;
  diagnosis?: string[];
  treatment?: string[];
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    traceId?: string;
    [key: string]: unknown;
  };
} 