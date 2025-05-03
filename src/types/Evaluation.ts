export interface PatientEval {
  id: string;
  patientId: string;
  visitDate: string;
  chiefComplaint: string;
  symptoms: string[];
  diagnosis: string;
  treatmentPlan: string;
  prognosis: string;
  followUp: string;
  voiceApprovedNotes?: string[];
  metadata: {
    lastUpdated: string;
    traceId?: string;
    source?: 'form' | 'voice' | 'copilot';
  };
}

export interface StructuredSuggestion {
  field: keyof PatientEval;
  value: string | string[];
  confidence: number;
  source: string;
  metadata?: Record<string, string>;
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