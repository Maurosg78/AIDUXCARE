/**
 * Adaptadores para manejo de tipos legados
 * 
 * Este archivo proporciona interfaces y funciones para facilitar
 * la transición entre las interfaces antiguas y nuevas del proyecto.
 */

import type { Patient, Visit  } from '@/core/types';

/**
 * Tipo que representa un paciente compatible con código legacy
 * que puede usar tanto las propiedades nuevas (firstName, lastName)
 * como las antiguas (nombre, edad, etc.)
 */
export interface LegacyPatient extends Omit<Patient, 'name'> {
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
export interface LegacyVisit extends Omit<Visit, 'status'> {
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
export function adaptPatientToLegacy(patient: Patient): LegacyPatient {
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
export function adaptVisitToLegacy(visit: Visit): LegacyVisit {
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
export function adaptLegacyToPatient(legacyPatient: LegacyPatient): Patient {
  const { nombre, apellido, edad, telefono, ...standardPatient } = legacyPatient;
  
  // Asegurar que las propiedades estándar estén definidas
  return {
    ...standardPatient,
    firstName: standardPatient.firstName || (nombre ? nombre.split(' ')[0] : ''),
    lastName: standardPatient.lastName || apellido || (nombre ? nombre.split(' ').slice(1).join(' ') : ''),
    age: standardPatient.age || edad,
    phone: standardPatient.phone || telefono
  } as Patient;
}

/**
 * Convierte un LegacyVisit de vuelta a un Visit estándar
 */
export function adaptLegacyToVisit(legacyVisit: LegacyVisit): Visit {
  const { modalidad, scheduledDate, motivo, ...standardVisit } = legacyVisit;
  
  // Adaptar el estado "in_progress" al estándar "scheduled"
  const standardStatus = standardVisit.status === 'in_progress' ? 'scheduled' : standardVisit.status;
  
  return {
    ...standardVisit,
    status: standardStatus,
    visitType: standardVisit.visitType || modalidad,
    date: standardVisit.date || scheduledDate,
    reason: standardVisit.reason || motivo
  } as Visit;
} 