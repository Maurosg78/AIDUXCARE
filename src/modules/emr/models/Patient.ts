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
  medicalRecordNumber?: string;
}
