import { PatientVisit } from '../models';
import { StorageService } from './StorageService.js';

const STORAGE_KEY = 'visits';

class VisitService {
  static async getAll(): Promise<PatientVisit[]> {
    return StorageService.load<PatientVisit[]>(STORAGE_KEY) || [];
  }

  static async getByPatientId(patientId: string): Promise<PatientVisit[]> {
    return this.getAll().then(visits => visits.filter(v => v.patientId === patientId));
  }

  static async getByVisitId(id: string): Promise<PatientVisit | undefined> {
    return this.getAll().then(visits => visits.find(v => v.id === id));
  }

  static async create(visit: PatientVisit): Promise<void> {
    const visits = await this.getAll();
    visits.push(visit);
    StorageService.save(STORAGE_KEY, visits);
  }

  static async update(updated: PatientVisit): Promise<void> {
    const visits = await this.getAll();
    const newVisits = visits.map(v => v.id === updated.id ? updated : v);
    StorageService.save(STORAGE_KEY, newVisits);
  }

  static async delete(id: string): Promise<void> {
    const visits = await this.getAll();
    const newVisits = visits.filter(v => v.id !== id);
    StorageService.save(STORAGE_KEY, newVisits);
  }

  static async clearAll(): Promise<void> {
    StorageService.remove(STORAGE_KEY);
  }
}

export default VisitService;
