export interface PatientEval {
  patientId: string;
  traceId?: string;
  anamnesis?: string;
  exam?: string;
  diagnosis?: string;
  plan?: string;
  voiceApprovedNotes?: string[];
  voiceRejectedNotes?: string[];
  completenessScore?: number;
  observaciones?: string;
  [key: string]: any;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  medicalHistory?: {
    conditions: string[];
    medications: string[];
    allergies: string[];
    lastVisit?: string;
  };
  currentSymptoms?: {
    chiefComplaint: string;
    symptoms: string[];
    onset: string;
    severity: 'Leve' | 'Moderado' | 'Severo';
    aggravatingFactors: string[];
    relievingFactors: string[];
  };
  created_at?: string;
  birthDate: string;
  email?: string;
  phone?: string;
  address?: string;
  history?: string;
  evaluations?: PatientEval[];
  metadata?: {
    [key: string]: any;
  };
}

export interface CopilotFeedback {
  field: string;
  value: string;
  accepted: boolean;
}

export interface CopilotFormData {
  motivo: string;
  observaciones: string;
  diagnostico: string;
  traceId?: string;
} 