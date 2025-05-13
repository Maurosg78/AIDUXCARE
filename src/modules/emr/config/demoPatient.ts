import type { PatientEval  } from '@/types/Evaluation';

export const DEMO_PATIENT_ID = 'demo-onboarding';

export const demoPatientData = {
  id: DEMO_PATIENT_ID,
  firstName: 'Demo',
  lastName: 'Paciente',
  dateOfBirth: '1985-01-15',
  gender: 'prefer-not-to-say',
  email: 'demo@example.com',
  phone: '+56912345678',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const demoVisitData: Partial<PatientEval> = {
  id: 'demo-visit-1',
  patientId: DEMO_PATIENT_ID,
  visitDate: new Date().toISOString(),
  chiefComplaint: 'Dolor cervical',
  symptoms: ['Dolor al girar el cuello', 'Rigidez matutina'],
  diagnosis: 'Cervicalgia mecánica',
  treatmentPlan: 'Ejercicios de movilidad cervical',
  prognosis: 'Favorable con tratamiento',
  followUp: 'Control en 2 semanas',
  metadata: {
    lastUpdated: new Date().toISOString(),
    source: 'form' as const
  }
}; 