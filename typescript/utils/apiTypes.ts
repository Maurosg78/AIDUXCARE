import type { Patient } from '../src/types/clinical/Patient';
import type { Visit } from '../src/types/clinical/Visit';
import type { ClinicalEvaluation } from '../src/types/clinical/ClinicalEvaluation';
import type { CopilotSuggestion } from '../src/types/clinical/CopilotSuggestion';
import type { AuditLogEntry } from '../src/types/clinical/AuditLogEntry';

// DTOs para entrada de API
export interface CreatePatientDTO {
  name: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  contactInfo: {
    email?: string;
    phone?: string;
    address?: string;
  };
}

export interface UpdatePatientDTO extends Partial<CreatePatientDTO> {
  id: string;
}

export interface CreateVisitDTO {
  patientId: string;
  date: string;
  type: 'routine' | 'emergency' | 'follow-up';
  notes?: string;
}

export interface CreateEvaluationDTO {
  patientId: string;
  visitId: string;
  evaluationDate: string;
  sections: {
    vitalSigns: {
      bloodPressure: string;
      heartRate: number;
      temperature: number;
      respiratoryRate: number;
    };
    symptoms: string[];
    observations: string;
    recommendations: string[];
  };
}

// Mappers para convertir entre DTOs y modelos de dominio
export const mapToPatient = (dto: CreatePatientDTO): Omit<Patient, 'id'> => ({
  name: dto.name,
  dateOfBirth: new Date(dto.dateOfBirth),
  gender: dto.gender,
  contactInfo: dto.contactInfo,
  createdAt: new Date(),
  updatedAt: new Date()
});

export const mapToVisit = (dto: CreateVisitDTO): Omit<Visit, 'id'> => ({
  patientId: dto.patientId,
  date: new Date(dto.date),
  type: dto.type,
  notes: dto.notes || '',
  status: 'scheduled',
  createdAt: new Date(),
  updatedAt: new Date()
});

export const mapToEvaluation = (dto: CreateEvaluationDTO): Omit<ClinicalEvaluation, 'id'> => ({
  patientId: dto.patientId,
  visitId: dto.visitId,
  evaluationDate: new Date(dto.evaluationDate),
  sections: dto.sections,
  status: 'in_progress',
  audit: [],
  metadata: {
    version: '1.0',
    lastModified: new Date()
  }
});

// Type guards para validar tipos en runtime
export const isPatient = (obj: unknown): obj is Patient => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'dateOfBirth' in obj &&
    'gender' in obj
  );
};

export const isVisit = (obj: unknown): obj is Visit => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'patientId' in obj &&
    'date' in obj &&
    'type' in obj
  );
};

export const isEvaluation = (obj: unknown): obj is ClinicalEvaluation => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'patientId' in obj &&
    'visitId' in obj &&
    'evaluationDate' in obj &&
    'sections' in obj
  );
}; 