export interface PatientEval {
  id: string;
  patientId: string;
  visitDate: string;
  chiefComplaint?: string;
  symptoms?: string[];
  diagnosis?: string;
  treatmentPlan?: string;
  prognosis?: string;
  followUp?: string;
  voiceApprovedNotes?: string[];
  metadata?: {
    traceId?: string;
    lastUpdated?: string;
  };
}

export interface EvalResult {
  patientId: string;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
}

export interface EvalRule {
  name: string;
  check: (fields: Record<string, any>) => boolean;
  message: string;
}

export interface EvalConfig {
  criticalFields: string[];
  consistencyRules: EvalRule[];
} 