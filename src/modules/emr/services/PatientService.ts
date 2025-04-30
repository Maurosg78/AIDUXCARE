import { Patient, PatientVisit } from "../models/Patient";

class PatientService {
  private static instance: PatientService;
  private patients: Patient[] = [
    {
      id: "1",
      firstName: "Pilar",
      lastName: "López",
      dateOfBirth: "1973-12-31",
      gender: "female",
      email: "pilar@example.com",
      phone: "+34 600 123 456",
      createdAt: "2024-01-01T09:00:00Z",
      updatedAt: "2025-04-01T12:00:00Z",
      medicalRecordNumber: "AIDUX-001"
    }
  ];
  private visits: PatientVisit[] = [
    {
      id: "v1",
      patientId: "1",
      visitDate: "2025-04-10T10:00:00Z",
      visitType: "initial",
      status: "completed",
      notes: "Primera evaluación con diagnóstico de dolor cervicobraquial bilateral."
    },
    {
      id: "v2",
      patientId: "1",
      visitDate: "2025-04-17T10:00:00Z",
      visitType: "treatment",
      status: "completed",
      notes: "Ejercicios de movilidad cervical y técnica de liberación miofascial."
    }
  ];

  private constructor() {}

  static getInstance(): PatientService {
    if (!PatientService.instance) {
      PatientService.instance = new PatientService();
    }
    return PatientService.instance;
  }

  async getPatients(): Promise<Patient[]> {
    return this.patients;
  }

  async getPatientById(id: string): Promise<Patient | undefined> {
    return this.patients.find(p => p.id === id);
  }

  async getPatientVisits(patientId: string): Promise<PatientVisit[]> {
    return this.visits.filter(v => v.patientId === patientId);
  }
}

export default PatientService;
