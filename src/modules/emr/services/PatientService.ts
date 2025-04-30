import { Patient } from '../models/Patient';
import { StorageService } from './StorageService';

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
}

export default PatientService;
