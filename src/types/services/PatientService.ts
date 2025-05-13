import type { Patient } from '../shared/Patient';

export interface PatientService {
  getPatient(id: string): Promise<Patient>;
  getPatients(): Promise<Patient[]>;
  createPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient>;
  updatePatient(id: string, patient: Partial<Patient>): Promise<Patient>;
  deletePatient(id: string): Promise<void>;
  searchPatients(query: string): Promise<Patient[]>;
  getPatientHistory(id: string): Promise<{
    visits: Array<{
      id: string;
      date: string;
      type: string;
      status: string;
    }>;
    evaluations: Array<{
      id: string;
      date: string;
      status: string;
    }>;
  }>;
} 