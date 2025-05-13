/**
 * Barrel file principal para exportar todos los tipos del proyecto
 * Los tipos están organizados alfabéticamente por categoría
 */

// Tipos de audio
export * from './shared/ChecklistAudioItem';

// Tipos de auditoría
export * from './shared/AuditLogEntry';

// Tipos clínicos
export * from './shared/ClinicalEvaluation';
export * from './shared/Patient';
export * from './shared/Visit';

// Tipos de copilot
export * from './shared/CopilotSuggestion';

// Tipos de exportación
export * from './shared/VisitPDFMetadata';

// Tipos de autenticación
export * from './custom/SessionTypes';

// Tipos de Langfuse
export * from './custom/LangfuseTypes';

// Tipos de impacto
export * from './impact';

// Tipos de eventos
export * from './events';

// Tipos legacy
export * from './legacy-adapters';

// Tipos de adaptadores para componentes
export * from './component-adapters';

// Tipos de sugerencias - archivo vacío, se usa la versión en shared
// export * from './suggestions';

// Tipos de utilidades (usando namespaces para evitar colisiones)
export * as AuthUtils from './utils/auth';
export * as RouterUtils from './utils/router';

// Exportar tipos de servicios
export * from './services/AuditLogService';
export * from './services/PatientService';
export * from './services/VisitService';

// Exportar tipos de testing (solo para entorno de pruebas)
export * from './testing/index';

// Export aliases para compatibilidad hacia atrás

// Interfaces comunes estandarizadas
export interface CommonPatient {
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

export interface CommonVisit {
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

export interface CommonClinicalEvaluation {
  id?: string | undefined;
  visitId: string;
  patientId: string;
  examenFisico?: string | undefined;
  evaluacionPostural?: string | undefined;
  antecedentes?: string | undefined;
}

export interface CommonPatientEval {
  patientId: string;
  traceId: string;
  motivo?: string | undefined;
  diagnosticoFisioterapeutico?: string | undefined;
  tratamientoPropuesto?: string | undefined;
} 