import { Patient } from '../models/Patient';
import { StorageService } from './StorageService';
import VisitService from './VisitService';
import { VisitData } from '../types';

const STORAGE_KEY = 'patients';

class PatientService {
  static async getAll(): Promise<Patient[]> {
    return StorageService.load<Patient[]>(STORAGE_KEY) || [];
  }

  static async getById(id: string): Promise<Patient | undefined> {
    return this.getAll().then(patients => patients.find(p => p.id === id));
  }

  static async create(patient: Patient): Promise<void> {
    const patients = await this.getAll();
    patients.push(patient);
    StorageService.save(STORAGE_KEY, patients);
  }

  static async update(updated: Patient): Promise<void> {
    const patients = await this.getAll();
    const newPatients = patients.map(p => p.id === updated.id ? updated : p);
    StorageService.save(STORAGE_KEY, newPatients);
  }

  static async delete(id: string): Promise<void> {
    const patients = await this.getAll();
    const newPatients = patients.filter(p => p.id !== id);
    StorageService.save(STORAGE_KEY, newPatients);
  }

  static async clearAll(): Promise<void> {
    StorageService.remove(STORAGE_KEY);
  }

  static async saveVisitData(patientId: string, data: Omit<VisitData, 'patientId' | 'createdAt'>): Promise<VisitData> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));

    const visitData: VisitData = {
      ...data,
      patientId,
      createdAt: new Date().toISOString()
    };

    // Obtener visitas existentes
    const storedVisits = localStorage.getItem(STORAGE_KEY);
    const visits = storedVisits ? JSON.parse(storedVisits) : [];

    // Agregar nueva visita
    visits.push(visitData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visits));

    return visitData;
  }

  static async getVisits(patientId: string): Promise<VisitData[]> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));

    const storedVisits = localStorage.getItem(STORAGE_KEY);
    const visits = storedVisits ? JSON.parse(storedVisits) : [];

    return visits.filter((visit: VisitData) => visit.patientId === patientId);
  }
}

// Seed de pacientes simulados y visitas iniciales
(async function seedPatientsAndVisits() {
  const existing = await PatientService.getAll();
  if (!existing.find(p => p.id === 'javier-ruiz-1966')) {
    const now = new Date().toISOString();
    const paciente1: Patient = {
      id: 'javier-ruiz-1966',
      firstName: 'Javier',
      lastName: 'Ruiz',
      dateOfBirth: new Date(new Date().getFullYear() - 59, 0, 1).toISOString(),
      gender: 'male',
      createdAt: now,
      updatedAt: now
    };
    await PatientService.create(paciente1);
    await VisitService.create({
      id: 'jr-visita-001',
      patientId: paciente1.id,
      visitDate: now,
      visitType: 'postoperatorio',
      status: 'completed',
      notes: 'Postoperatorio de prótesis total de cadera'
    });
  }
  if (!existing.find(p => p.id === 'lucia-gomez-1982')) {
    const now = new Date().toISOString();
    const paciente2: Patient = {
      id: 'lucia-gomez-1982',
      firstName: 'Lucía',
      lastName: 'Gómez',
      dateOfBirth: new Date(1982, 0, 1).toISOString(),
      gender: 'female',
      createdAt: now,
      updatedAt: now
    };
    await PatientService.create(paciente2);
    await VisitService.create({
      id: 'lg-visita-001',
      patientId: paciente2.id,
      visitDate: now,
      visitType: 'diagnostico',
      status: 'completed',
      notes: 'Diagnóstico reciente de ELA'
    });
  }
  if (!existing.find(p => p.id === 'carla-ortega-2018')) {
    const now = new Date().toISOString();
    const paciente3: Patient = {
      id: 'carla-ortega-2018',
      firstName: 'Carla',
      lastName: 'Ortega',
      dateOfBirth: new Date(2018, 0, 1).toISOString(),
      gender: 'female',
      createdAt: now,
      updatedAt: now
    };
    await PatientService.create(paciente3);
    await VisitService.create({
      id: 'co-visita-001',
      patientId: paciente3.id,
      visitDate: now,
      visitType: 'trauma',
      status: 'completed',
      notes: 'Dolor lumbar persistente post caída'
    });
  }
})();

export default PatientService;
