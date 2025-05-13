/**
 * Tipos y adaptadores para componentes
 * 
 * Este archivo proporciona interfaces en formato no namespace para
 * corregir problemas de tipado en la aplicación.
 */

import type { ReactNode } from 'react';

// Interfaces tipo para componentes (concretas, no extensiones)
export interface Visit {
  id: string;
  patientId: string;
  scheduledDate: string;
  date?: string;
  duration: number;
  status: string;
  paymentStatus: string;
  motivo?: string;
  modalidad?: string;
  diagnosticoFisioterapeutico?: string;
  tratamientoPropuesto?: string;
  visitType?: string;
  visitDate?: string;
  reason?: string;
  [key: string]: unknown;
}

export interface Patient {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  dateOfBirth?: string | Date;
  birthDate?: string | Date;
  contactInfo?: {
    email?: string;
    phone?: string;
  };
  age?: number;
  [key: string]: unknown;
}

export interface ClinicalEvaluation {
  id: string;
  patientId: string;
  visitId: string;
  date?: string;
  status?: string;
  sections?: Record<string, unknown>;
  anamnesis?: string;
  exam?: string;
  diagnosis?: string;
  plan?: string;
  voiceApprovedNotes?: string[];
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface PatientEval {
  patientId: string;
  traceId: string;
  motivo?: string;
  diagnosticoFisioterapeutico?: string;
  tratamientoPropuesto?: string;
  [key: string]: unknown;
}

// Para casos donde se necesitan tipos opcionales
export type VisitData = Partial<Visit>;
export type PatientData = Partial<Patient>;
export type ClinicalEvaluationData = Partial<ClinicalEvaluation>;
export type PatientEvalData = Partial<PatientEval>;

// Exportación de tipos de sugerencias de copilot
export interface CopilotSuggestion {
  id: string;
  message: string;
  icon: string;
  type: 'info' | 'warning' | 'success';
}

// Tipos de router
export interface LinkProps {
  to: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export interface NavigateProps {
  to: string;
  replace?: boolean;
  state?: Record<string, unknown>;
}

export type { RouteObject } from '@/core/utils/router'; 