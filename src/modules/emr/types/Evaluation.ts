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