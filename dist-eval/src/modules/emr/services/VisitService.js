import { StorageService } from './StorageService.js';
const STORAGE_KEY = 'visits';
class VisitService {
    static async getAll() {
        return StorageService.load(STORAGE_KEY) || [];
    }
    static async getByPatientId(patientId) {
        return this.getAll().then(visits => visits.filter(v => v.patientId === patientId));
    }
    static async getByVisitId(id) {
        return this.getAll().then(visits => visits.find(v => v.id === id));
    }
    static async create(visit) {
        const visits = await this.getAll();
        visits.push(visit);
        StorageService.save(STORAGE_KEY, visits);
    }
    static async update(updated) {
        const visits = await this.getAll();
        const newVisits = visits.map(v => v.id === updated.id ? updated : v);
        StorageService.save(STORAGE_KEY, newVisits);
    }
    static async delete(id) {
        const visits = await this.getAll();
        const newVisits = visits.filter(v => v.id !== id);
        StorageService.save(STORAGE_KEY, newVisits);
    }
    static async clearAll() {
        StorageService.remove(STORAGE_KEY);
    }
}
export default VisitService;
