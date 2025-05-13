/**
 * Adaptadores para manejo de tipos legados
 * 
 * Este archivo proporciona interfaces y funciones para facilitar
 * la transición entre las interfaces antiguas y nuevas del proyecto.
 */

// Importamos los tipos adaptados en lugar de los tipos del core
import type { AdaptedPatient, AdaptedVisit } from './component-adapters';

/**
 * Tipo que representa un paciente compatible con código legacy
 * que puede usar tanto las propiedades nuevas (firstName, lastName)
 * como las antiguas (nombre, edad, etc.)
 */
export interface LegacyPatient extends Omit<AdaptedPatient, 'name'> {
  // Propiedades antiguas mapeadas a las nuevas
  nombre?: string;
  apellido?: string;
  edad?: number;
  telefono?: string;
  // Cualquier otra propiedad legacy
  [key: string]: unknown;
}

/**
 * Tipo que representa una visita compatible con código legacy
 */
export interface LegacyVisit extends Omit<AdaptedVisit, 'status'> {
  // Propiedades adicionales para compatibilidad
  modalidad?: string;
  scheduledDate?: string;
  duration?: number;
  paymentStatus?: 'paid' | 'pending';
  doctorId?: string;
  doctorName?: string;
  motivo?: string;
  // In-progress es un estado adicional en algunas partes del código
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  // Cualquier otra propiedad legacy
  [key: string]: unknown;
}

/**
 * Adapta un objeto Patient a un LegacyPatient con propiedades retrocompatibles
 */
export function adaptPatientToLegacy(patient: AdaptedPatient): LegacyPatient {
  return {
    ...patient,
    // Propiedades legadas calculadas
    nombre: patient.name || `${patient.firstName} ${patient.lastName}`.trim(),
    apellido: patient.lastName,
    edad: patient.age,
    telefono: patient.phone
  };
}

/**
 * Adapta un objeto Visit a un LegacyVisit con propiedades retrocompatibles
 */
export function adaptVisitToLegacy(visit: AdaptedVisit): LegacyVisit {
  return {
    ...visit,
    // Propiedades legadas calculadas
    modalidad: visit.visitType || visit.type,
    scheduledDate: visit.date || visit.visitDate,
    motivo: visit.reason
  };
}

/**
 * Convierte un LegacyPatient de vuelta a un Patient estándar
 */
export function adaptLegacyToPatient(legacyPatient: LegacyPatient): AdaptedPatient {
  const { nombre, apellido, edad, telefono, ...standardPatient } = legacyPatient;
  
  // Asegurar que las propiedades estándar estén definidas
  return {
    ...standardPatient,
    firstName: standardPatient.firstName || (nombre ? nombre.split(' ')[0] : ''),
    lastName: standardPatient.lastName || apellido || (nombre ? nombre.split(' ').slice(1).join(' ') : ''),
    age: standardPatient.age || edad,
    phone: standardPatient.phone || telefono
  } as AdaptedPatient;
}

/**
 * Convierte un LegacyVisit de vuelta a un Visit estándar
 */
export function adaptLegacyToVisit(legacyVisit: LegacyVisit): AdaptedVisit {
  const { modalidad, scheduledDate, motivo, ...standardVisit } = legacyVisit;
  
  // Adaptar el estado "in_progress" al estándar "scheduled"
  const standardStatus = standardVisit.status === 'in_progress' ? 'scheduled' : standardVisit.status;
  
  return {
    ...standardVisit,
    status: standardStatus,
    visitType: standardVisit.visitType || modalidad,
    date: standardVisit.date || scheduledDate,
    reason: standardVisit.reason || motivo
  } as AdaptedVisit;
}

/**
 * Adaptadores legacy para mantener compatibilidad con código antiguo
 * 
 * Este archivo contiene definiciones minimales para los tipos que han sido
 * eliminados pero aún son importados en partes del código o pruebas.
 */

// Re-exportar tipos actualizados desde component-adapters
export type { 
  AdaptedVisit as Visit,
  AdaptedPatient as Patient,
  AdaptedClinicalEvaluation as ClinicalEvaluation,
  AdaptedPatientEval as PatientEval
} from './component-adapters';

// Legacy Patient (para archivos que importan de ./types/Patient)
export interface LegacyPatient {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  dateOfBirth?: string;
  age?: number;
  gender?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
  };
  // Props del modelo legacy
  nombre?: string;
  apellido?: string;
  telefono?: string;
  edad?: number;
  [key: string]: unknown;
}

// Legacy Visit (para archivos que importan de ./types/Visit)
export interface LegacyVisit {
  id: string;
  patientId: string;
  date: string;
  scheduledDate?: string;
  status: string;
  paymentStatus?: string;
  motivo?: string;
  modalidad?: string;
  diagnosticoFisioterapeutico?: string;
  tratamientoPropuesto?: string;
  visitType?: string;
  visitDate?: string;
  reason?: string;
  professionalId?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

// Legacy Clinical Evaluation
export interface LegacyClinicalEvaluation {
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

// Adaptador para convertir Patient a LegacyPatient
export function adaptToLegacyPatient(patient: LegacyPatient): LegacyPatient {
  return {
    nombre: patient.firstName || '',
    apellido: patient.lastName || '',
    edad: patient.age,
    telefono: patient.phone,
    ...patient,
    // Asegurar que tenga firstName y lastName
    firstName: patient.firstName || patient.nombre || '',
    lastName: patient.lastName || patient.apellido || '',
    // Asegurar que tenga name
    name: patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`.trim()
  };
}

// Adaptador para convertir Visit a LegacyVisit
export function adaptToLegacyVisit(visit: LegacyVisit): LegacyVisit {
  return {
    modalidad: visit.visitType,
    scheduledDate: visit.visitDate || visit.date,
    motivo: visit.reason || visit.motivo,
    ...visit,
    // Asegurar que tenga date
    date: visit.date || visit.scheduledDate || visit.visitDate || '',
    // Asegurar que tenga patientId
    patientId: visit.patientId
  };
}

// Función para adaptar a CopilotSuggestion (para compatibilidad con APIs antiguas)
export interface CopilotSuggestion {
  id?: string;
  type: 'diagnosis' | 'examination' | 'treatment' | 'observation';
  text: string;
  source?: string;
  confidence?: number;
  accepted?: boolean;
  createdAt?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

// Definición de AuditLogEntry para compatibilidad con pruebas
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details?: Record<string, unknown>;
  [key: string]: unknown;
}

// Exportación default de los tipos para compatibilidad con importaciones default
import { 
  AdaptedPatient, 
  AdaptedVisit, 
  AdaptedClinicalEvaluation 
} from './component-adapters';

// Crear valores reales para la exportación default
const DefaultPatient = {} as AdaptedPatient;
const DefaultVisit = {} as AdaptedVisit;
const DefaultClinicalEvaluation = {} as AdaptedClinicalEvaluation;

// Exportación simple de Patient para módulos que importan el tipo directamente
export default { 
  Patient: DefaultPatient, 
  Visit: DefaultVisit, 
  ClinicalEvaluation: DefaultClinicalEvaluation 
}; 