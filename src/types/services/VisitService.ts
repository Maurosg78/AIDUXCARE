import type { Visit } from '../shared/Visit';

export interface VisitService {
  getVisit(id: string): Promise<Visit>;
  getVisits(patientId: string): Promise<Visit[]>;
  createVisit(visit: Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Visit>;
  updateVisit(id: string, visit: Partial<Visit>): Promise<Visit>;
  deleteVisit(id: string): Promise<void>;
  getVisitSchedule(startDate: string, endDate: string): Promise<Visit[]>;
  getVisitStats(patientId: string): Promise<{
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
  }>;
} 