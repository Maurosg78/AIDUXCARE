/**
 * Tipos específicos para el módulo EMR
 */

export interface Visit {
  id: string;
  patientId: string;
  professionalId: string;
  scheduledDate: string;
  duration: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  paymentStatus: 'paid' | 'pending';
  motivo?: string | undefined;
  modalidad?: string | undefined;
  diagnosticoFisioterapeutico?: string | undefined;
  tratamientoPropuesto?: string | undefined;
}

export interface Patient {
  id: string;
  firstName?: string | undefined;
  lastName?: string | undefined;
  name?: string | undefined;
  email?: string | undefined;
  phone?: string | undefined;
  phoneNumber?: string | undefined;
  birthDate?: string | undefined;
  dateOfBirth?: string | Date | undefined;
  contactInfo?: {
    email?: string | undefined;
    phone?: string | undefined;
  } | undefined;
}

export interface ClinicalEvaluation {
  id?: string | undefined;
  visitId: string;
  patientId: string;
  examenFisico?: string | undefined;
  evaluacionPostural?: string | undefined;
  antecedentes?: string | undefined;
}

export interface PatientEval {
  patientId: string;
  traceId: string;
  motivo?: string | undefined;
  diagnosticoFisioterapeutico?: string | undefined;
  tratamientoPropuesto?: string | undefined;
  motivoConsulta?: string | undefined;
} 