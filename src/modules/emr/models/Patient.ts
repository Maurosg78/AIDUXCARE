export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  email?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientVisit {
  id: string;
  patientId: string;
  visitDate: string;
  visitType: 'initial' | 'follow-up' | 'evaluation' | 'treatment' | 'discharge' | 'consultation';
  status: 'scheduled' | 'checked-in' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
}
