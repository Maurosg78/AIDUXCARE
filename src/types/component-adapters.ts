/**
 * Adaptadores de tipos específicos para componentes
 * 
 * Este archivo define interfaces adaptadas para usar en componentes
 * que necesitan compatibilidad con diferentes estructuras de datos.
 */

/**
 * Visita adaptada para componentes de detalle
 */
export interface AdaptedVisit {
  id: string;
  patientId: string;
  date?: string | undefined;
  scheduledDate?: string | undefined;
  visitDate?: string | undefined;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  paymentStatus?: 'paid' | 'pending' | undefined;
  reason?: string | undefined;
  motivo?: string | undefined;
  modalidad?: string | undefined;
  visitType?: string | undefined;
  type?: string | undefined;
  duration?: number | undefined;
  diagnosticoFisioterapeutico?: string | undefined;
  tratamientoPropuesto?: string | undefined;
  professionalId?: string | undefined;
  createdAt?: string | undefined;
  updatedAt?: string | undefined;
  [key: string]: unknown;
}

/**
 * Paciente adaptado para componentes de detalle
 */
export interface AdaptedPatient {
  id: string;
  firstName?: string | undefined;
  lastName?: string | undefined;
  name?: string | undefined;
  email?: string | undefined;
  phone?: string | undefined;
  birthDate?: string | Date | undefined;
  dateOfBirth?: string | Date | undefined;
  age?: number | undefined;
  gender?: string | undefined;
  contactInfo?: {
    email?: string | undefined;
    phone?: string | undefined;
  } | undefined;
  [key: string]: unknown;
}

/**
 * Evaluación clínica adaptada para componentes
 */
export interface AdaptedClinicalEvaluation {
  id: string;
  patientId: string;
  visitId: string;
  date?: string | undefined;
  status?: string | undefined;
  sections?: Record<string, unknown> | undefined;
  anamnesis?: string | undefined;
  exam?: string | undefined;
  diagnosis?: string | undefined;
  plan?: string | undefined;
  voiceApprovedNotes?: string[] | undefined;
  metadata?: Record<string, unknown> | undefined;
  [key: string]: unknown;
}

/**
 * Evaluación de paciente adaptada para componentes
 */
export interface AdaptedPatientEval {
  patientId: string;
  traceId: string;
  motivo?: string | undefined;
  diagnosticoFisioterapeutico?: string | undefined;
  tratamientoPropuesto?: string | undefined;
  anamnesis?: string | undefined;
  exam?: string | undefined;
  diagnosis?: string | undefined;
  plan?: string | undefined;
  notes?: string | undefined;
  [key: string]: unknown;
}

/**
 * Adaptadores de componentes para tipos de datos
 * 
 * Este archivo proporciona interfaces adaptadas para componentes
 * que dependen de módulos eliminados o modificados.
 */

/**
 * Entrada de log de auditoría adaptada para componentes
 */
export interface AdaptedAuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details?: Record<string, unknown> | undefined;
  [key: string]: unknown;
}

// Funciones auxiliares para adaptar datos

/**
 * Adapta un objeto de paciente a la estructura AdaptedPatient
 */
export function adaptPatient(patient: Record<string, unknown>): AdaptedPatient {
  return {
    ...patient,
    // Asegurar campos mínimos
    id: String(patient.id || ''),
    name: patient.name as string || 
          `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 
          patient.nombre as string || '',
    firstName: patient.firstName as string || 
              (patient.nombre as string)?.split(' ')[0] || '',
    lastName: patient.lastName as string || 
             patient.apellido as string || 
             ((patient.nombre as string)?.split(' ').slice(1).join(' ') || '')
  };
}

/**
 * Adapta un objeto de visita a la estructura AdaptedVisit
 */
export function adaptVisit(visit: Record<string, unknown>): AdaptedVisit {
  // Determinar cuál es el campo de fecha a usar
  const dateField = visit.date || visit.visitDate || visit.scheduledDate;
  
  // Determinar status, mapeando "in_progress" como compatibilidad
  let status = visit.status as string;
  if (!['scheduled', 'in_progress', 'completed', 'cancelled'].includes(status)) {
    status = 'scheduled';
  }
  
  return {
    ...visit,
    // Asegurar campos mínimos
    id: String(visit.id || ''),
    patientId: String(visit.patientId || ''),
    date: dateField as string,
    status: status as AdaptedVisit['status'],
    reason: (visit.reason || visit.motivo) as string,
    visitType: (visit.visitType || visit.modalidad || visit.type) as string
  };
}

/**
 * Adapta un objeto de evaluación clínica a la estructura AdaptedClinicalEvaluation
 */
export function adaptClinicalEvaluation(evaluation: Record<string, unknown>): AdaptedClinicalEvaluation {
  return {
    ...evaluation,
    // Asegurar campos mínimos
    id: String(evaluation.id || ''),
    patientId: String(evaluation.patientId || ''),
    visitId: String(evaluation.visitId || '')
  };
}

/**
 * Adapta una entrada de log de auditoría a la estructura AdaptedAuditLogEntry
 */
export function adaptAuditLogEntry(entry: Record<string, unknown>): AdaptedAuditLogEntry {
  return {
    ...entry,
    // Asegurar campos mínimos
    id: String(entry.id || ''),
    timestamp: entry.timestamp as string || new Date().toISOString(),
    userId: String(entry.userId || ''),
    action: String(entry.action || ''),
    resourceType: String(entry.resourceType || ''),
    resourceId: String(entry.resourceId || '')
  };
}

/**
 * Adapta un objeto de evaluación de paciente a la estructura AdaptedPatientEval
 */
export function adaptPatientEval(evaluation: Record<string, unknown>): AdaptedPatientEval {
  return {
    ...evaluation,
    // Asegurar campos mínimos
    patientId: String(evaluation.patientId || ''),
    traceId: String(evaluation.traceId || ''),
  };
} 