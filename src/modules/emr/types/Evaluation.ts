export interface Evaluation {
  id: string;
  patientId: string;
  visitDate: string;
  motivo: string;
  observaciones: string;
  diagnostico: string;
  alertas: string[];
  feedback: {
    type: 'omission' | 'suggestion' | 'diagnostic' | 'risk';
    severity: 'info' | 'warning' | 'error';
    message: string;
  }[];
  traceId?: string;
}

export interface PatientEval {
  patientId: string;
  traceId?: string;
  anamnesis?: string;
  exam?: string;
  diagnosis?: string;
  plan?: string;
  notes?: string;
  visitDate?: string;
  visitType?: string;
  status?: string;
  physicalExam?: string;
  diagnostico?: string;
  treatmentPlan?: string;
  motivo?: string;
  observaciones?: string;
  diagnosticoFisioterapeutico?: string;
  tratamientoPropuesto?: string;
} 