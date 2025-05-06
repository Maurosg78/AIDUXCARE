import { z } from 'zod';
import { Patient, PatientCreate } from '../models/Patient';
import { StorageService } from './StorageService';
import { v4 as uuidv4 } from 'uuid';
import VisitService from './VisitService';

const PatientSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string().min(1),
  edad: z.number().min(0).max(120),
  fechaNacimiento: z.string(),
  genero: z.enum(['masculino', 'femenino', 'otro']),
  telefono: z.string(),
  email: z.string().email(),
  seguroMedico: z.boolean(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type Patient = z.infer<typeof PatientSchema>;

export class PatientService {
  private static STORAGE_KEY = 'patients';

  static async getAll(): Promise<Patient[]> {
    return StorageService.load<Patient[]>(this.STORAGE_KEY) || [];
  }

  static async getById(id: string): Promise<Patient | undefined> {
    const patients = await this.getAll();
    return patients.find(p => p.id === id);
  }

  static async create(patientData: PatientCreate): Promise<Patient> {
    const patients = await this.getAll();
    
    const newPatient: Patient = {
      id: uuidv4(),
      ...patientData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    patients.push(newPatient);
    await StorageService.save(this.STORAGE_KEY, patients);
    return newPatient;
  }

  static async update(id: string, patientData: Partial<PatientCreate>): Promise<Patient | undefined> {
    const patients = await this.getAll();
    const index = patients.findIndex(p => p.id === id);
    
    if (index === -1) return undefined;

    const updatedPatient: Patient = {
      ...patients[index],
      ...patientData,
      updatedAt: new Date().toISOString()
    };

    patients[index] = updatedPatient;
    await StorageService.save(this.STORAGE_KEY, patients);
    return updatedPatient;
  }

  static async delete(id: string): Promise<boolean> {
    const patients = await this.getAll();
    const filteredPatients = patients.filter(p => p.id !== id);
    
    if (filteredPatients.length === patients.length) {
      return false;
    }

    await StorageService.save(this.STORAGE_KEY, filteredPatients);
    return true;
  }

  static async clearAll(): Promise<void> {
    StorageService.remove(this.STORAGE_KEY);
  }

  static async createPatient(patientData: Omit<Patient, 'id' | 'createdAt'>): Promise<Patient> {
    try {
      const newPatient: Patient = {
        id: crypto.randomUUID(),
        ...patientData,
        createdAt: new Date().toISOString(),
      };

      const validatedPatient = PatientSchema.parse(newPatient);

      const patients = await this.getAll();
      patients.push(validatedPatient);
      await StorageService.save(this.STORAGE_KEY, patients);

      return validatedPatient;
    } catch (error) {
      throw new Error(`Error al crear paciente: ${error}`);
    }
  }

  static async getPatients(): Promise<Patient[]> {
    const patientsJson = await StorageService.load<string>(this.STORAGE_KEY);
    return patientsJson ? JSON.parse(patientsJson) : [];
  }

  static async getPatientById(id: string): Promise<Patient | undefined> {
    const patients = await this.getPatients();
    return patients.find(p => p.id === id);
  }

  static async updatePatient(id: string, updateData: Partial<Omit<Patient, 'id'>>): Promise<Patient> {
    const patients = await this.getPatients();
    const index = patients.findIndex(p => p.id === id);

    if (index === -1) {
      throw new Error(`Paciente no encontrado: ${id}`);
    }

    const updatedPatient = {
      ...patients[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    const validatedPatient = PatientSchema.parse(updatedPatient);
    patients[index] = validatedPatient;
    await StorageService.save(this.STORAGE_KEY, JSON.stringify(patients));

    return validatedPatient;
  }
}

// Seed de pacientes simulados y visitas iniciales
(async function seedPatientsAndVisits() {
  const existing = await PatientService.getAll();
  if (!existing.find(p => p.id === 'javier-ruiz-1966')) {
    const now = new Date().toISOString();
    const paciente1: PatientCreate = {
      name: 'Javier',
      lastName: 'Ruiz',
      dateOfBirth: new Date(new Date().getFullYear() - 59, 0, 1).toISOString()
    };
    const createdPaciente1 = await PatientService.create(paciente1);
    await VisitService.create({
      id: 'jr-visita-001',
      patientId: createdPaciente1.id,
      visitDate: now,
      visitType: 'postoperatorio',
      status: 'completed',
      notes: 'Postoperatorio de prótesis total de cadera'
    });
  }
  if (!existing.find(p => p.id === 'lucia-gomez-1982')) {
    const now = new Date().toISOString();
    const paciente2: PatientCreate = {
      name: 'Lucía',
      lastName: 'Gómez',
      dateOfBirth: new Date(1982, 0, 1).toISOString()
    };
    const createdPaciente2 = await PatientService.create(paciente2);
    await VisitService.create({
      id: 'lg-visita-001',
      patientId: createdPaciente2.id,
      visitDate: now,
      visitType: 'diagnostico',
      status: 'completed',
      notes: 'Diagnóstico reciente de ELA'
    });
  }
  if (!existing.find(p => p.id === 'carla-ortega-2018')) {
    const now = new Date().toISOString();
    const paciente3: PatientCreate = {
      name: 'Carla',
      lastName: 'Ortega',
      dateOfBirth: new Date(2018, 0, 1).toISOString()
    };
    const createdPaciente3 = await PatientService.create(paciente3);
    await VisitService.create({
      id: 'co-visita-001',
      patientId: createdPaciente3.id,
      visitDate: now,
      visitType: 'trauma',
      status: 'completed',
      notes: 'Dolor lumbar persistente post caída'
    });
  }
})();

export default PatientService;
