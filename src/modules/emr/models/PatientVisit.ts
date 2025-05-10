import { PatientVisit as CorePatientVisit, PatientEval } from '@/core/types';

// Interfaz original de la aplicación
export interface PatientVisit {
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
  doctorName?: string;
  doctorId?: string;
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
  doctorName?: string;
  doctorId?: string;
  diagnosis?: string;
  treatment?: string;
  evaluations?: PatientEval[];

  constructor(data: Partial<PatientVisit> & { id: string; patientId: string; date: string; visitDate: string; visitType: string; status: 'scheduled' | 'completed' | 'cancelled' }) {
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
    this.doctorName = data.doctorName;
    this.doctorId = data.doctorId || data.professionalId;
    this.diagnosis = data.diagnosis;
    this.treatment = data.treatment;
    this.evaluations = data.evaluations;
  }

  // Convertir a CorePatientVisit
  toCorePatientVisit(): CorePatientVisit {
    return {
      id: this.id,
      patientId: this.patientId,
      patientName: this.patientName,
      doctorId: this.doctorId || this.professionalId || '',
      doctorName: this.doctorName,
      date: this.date,
      reason: this.reason || '',
      diagnosis: this.diagnosis,
      treatment: this.treatment,
      notes: this.notes,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      evaluations: this.evaluations
    };
  }

  // Método estático para convertir desde CorePatientVisit
  static fromCorePatientVisit(visit: CorePatientVisit): PatientVisitModel {
    return new PatientVisitModel({
      id: visit.id,
      patientId: visit.patientId,
      professionalId: visit.doctorId,
      date: visit.date,
      visitDate: visit.date,
      visitType: visit.reason || 'general',
      status: visit.status,
      patientName: visit.patientName,
      doctorName: visit.doctorName,
      doctorId: visit.doctorId,
      reason: visit.reason,
      diagnosis: visit.diagnosis,
      treatment: visit.treatment,
      notes: visit.notes,
      createdAt: visit.createdAt,
      updatedAt: visit.updatedAt,
      evaluations: visit.evaluations
    });
  }
}
