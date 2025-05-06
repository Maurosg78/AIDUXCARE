import { Patient, PatientSchema } from '../schemas/PatientSchema';
import { patientsSeed } from './seed/realPatientsSeed';
import { v4 as uuidv4 } from 'uuid';

/**
 * Store en memoria para pacientes
 * Proporciona una capa de persistencia temporal para desarrollo
 */
export let patients: Patient[] = [...patientsSeed];

/**
 * Obtiene un paciente por su ID
 */
export const getPatientById = (id: string): Patient | undefined => {
  return patients.find(p => p.id === id);
};

/**
 * Obtiene todos los pacientes
 */
export const getAllPatients = (): Patient[] => {
  return [...patients];
};

/**
 * Agrega un nuevo paciente
 */
export const addPatient = (patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Patient => {
  const now = new Date().toISOString();
  const newPatient: Patient = {
    id: uuidv4(),
    ...patientData,
    created_at: now,
    updated_at: now
  };

  // Validar datos con el schema
  const validatedPatient = PatientSchema.parse(newPatient);
  patients.push(validatedPatient);
  return validatedPatient;
};

/**
 * Actualiza un paciente existente
 */
export const updatePatient = (id: string, updatedFields: Partial<Omit<Patient, 'id' | 'created_at'>>): Patient | undefined => {
  const index = patients.findIndex(p => p.id === id);
  if (index === -1) return undefined;

  const updatedPatient: Patient = {
    ...patients[index],
    ...updatedFields,
    updated_at: new Date().toISOString()
  };

  // Validar datos actualizados
  const validatedPatient = PatientSchema.parse(updatedPatient);
  patients[index] = validatedPatient;
  return validatedPatient;
};

/**
 * Elimina un paciente por su ID
 */
export const deletePatient = (id: string): boolean => {
  const initialLength = patients.length;
  patients = patients.filter(p => p.id !== id);
  return patients.length !== initialLength;
}; 