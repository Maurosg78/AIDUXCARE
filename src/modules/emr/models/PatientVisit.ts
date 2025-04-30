export interface PatientVisit {
  id: string;
  patientId: string;
  visitDate: string;
  visitType: string;
  status: string;
  notes?: string;
  [key: string]: any;
}
