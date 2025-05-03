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
  birthDate: string;
  gender: string;
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