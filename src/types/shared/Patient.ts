/**
 * Tipos relacionados con pacientes
 */

/**
 * Género del paciente
 */
export type Gender = 'M' | 'F' | 'O';

/**
 * Evaluación de un paciente
 */
export interface PatientEvaluation {
  patientId: string;
  traceId?: string;
  anamnesis?: string;
  exam?: string;
  diagnosis?: string;
  plan?: string;
  voiceApprovedNotes?: string[];
  voiceRejectedNotes?: string[];
  completenessScore?: number;
  observaciones?: string;
  [key: string]: unknown;
}

/**
 * Feedback del copilot para un paciente
 */
export interface CopilotFeedback {
  field: string;
  value: string;
  accepted: boolean;
}

/**
 * Datos del formulario de copilot
 */
export interface CopilotFormData {
  motivo: string;
  observaciones: string;
  diagnostico: string;
  traceId?: string;
}

/**
 * Información de dirección
 */
export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

/**
 * Representa un paciente en el sistema
 */
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  birthDate: string;
  gender: Gender;
  address?: Address;
  medicalHistory?: string[];
  allergies?: string[];
  createdAt: string;
  updatedAt: string;
  evaluations?: PatientEvaluation[];
  metadata?: Record<string, unknown>;
} 