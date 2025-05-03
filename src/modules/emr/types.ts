export interface VisitData {
  chiefComplaint: string;
  symptoms: string;
  diagnosis: string;
  treatmentPlan: string;
  followUp: string;
  createdAt: string;
  patientId: string;
}

export interface ValidationErrors {
  chiefComplaint?: string;
  symptoms?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  followUp?: string;
} 