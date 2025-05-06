export interface Patient {
  id: string;
  name: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientCreate {
  name: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
}
