import type { Visit, PatientEval  } from '@/core/types';

// Extendemos la interfaz Visit original para agregar campos específicos de PatientVisit
export interface PatientVisit extends Visit {
  visitDate: string;
  visitType: string;
  patientName?: string;
  professionalName?: string;
  diagnosis?: string;
  treatment?: string;
  evaluations?: PatientEval[];
}

// Clase para compatibilidad con los tipos de core
export class PatientVisitModel implements PatientVisit {
  id: string;
  patientId: string;
  professionalId?: string;
  date: string;
  visitDate: string;
  visitType: string;
  type?: string;
  reason?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  location?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  patientName?: string;
  professionalName?: string;
  diagnosis?: string;
  treatment?: string;
  evaluations?: PatientEval[];

  constructor(data: Partial<PatientVisit> & { 
    id: string; 
    patientId: string; 
    date: string; 
    visitDate: string; 
    visitType: string; 
    status: 'scheduled' | 'completed' | 'cancelled' 
  }) {
    this.id = data.id;
    this.patientId = data.patientId;
    this.professionalId = data.professionalId;
    this.date = data.date;
    this.visitDate = data.visitDate;
    this.visitType = data.visitType;
    this.type = data.type;
    this.reason = data.reason;
    this.status = data.status;
    this.location = data.location;
    this.notes = data.notes;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.patientName = data.patientName;
    this.professionalName = data.professionalName;
    this.diagnosis = data.diagnosis;
    this.treatment = data.treatment;
    this.evaluations = data.evaluations;
  }

  // Convertir a core Visit
  toCoreVisit(): Visit {
    return {
      id: this.id,
      patientId: this.patientId,
      professionalId: this.professionalId,
      date: this.date,
      visitDate: this.visitDate,
      visitType: this.visitType,
      type: this.type,
      reason: this.reason,
      status: this.status,
      location: this.location,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Método estático para convertir desde core Visit
  static fromCoreVisit(visit: Visit): PatientVisitModel {
    return new PatientVisitModel({
      id: visit.id,
      patientId: visit.patientId,
      professionalId: visit.professionalId,
      date: visit.date || visit.visitDate || new Date().toISOString(),
      visitDate: visit.visitDate || visit.date || new Date().toISOString(),
      visitType: visit.visitType || visit.type || 'general',
      status: visit.status,
      reason: visit.reason,
      notes: visit.notes,
      createdAt: visit.createdAt,
      updatedAt: visit.updatedAt
    });
  }
}
