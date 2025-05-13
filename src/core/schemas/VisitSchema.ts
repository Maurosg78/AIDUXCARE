import type { Visit as VisitType  } from '@/core/types';

/**
 * Interfaz para definir visitas clínicas
 */
export interface Visit {
  id: string;
  patientId: string;
  professionalId?: string;
  professionalEmail: string;
  scheduledDate: string;
  duration?: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'cancelled' | 'refunded';
  motivo: string;
  modalidad?: 'presencial' | 'telematica';
  precio?: number;
  previousHistory?: boolean;
  createdAt?: string;
  updatedAt?: string;
  notes?: string;
  metadata?: {
    visit_type: string;
    duration_minutes: number;
    location?: string;
    follow_up_required: boolean;
  };
  visitDate: string;
  reason?: string;
  diagnosticoFisioterapeutico?: string;
  tratamientoPropuesto?: string;
}

/**
 * Interfaz para resumen de visita (versión simplificada)
 */
export interface VisitSummary {
  id: string;
  patientId: string;
  patientName: string;
  visitDate: string;
  visitType: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  professionalId?: string;
  professionalName?: string;
}

// Re-exportamos el tipo Visit desde el archivo central de tipos para mantener compatibilidad
export type { VisitType as VisitInterface }; 