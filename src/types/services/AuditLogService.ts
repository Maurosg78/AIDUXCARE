import type { AuditLogEntry } from '../shared/AuditLogEntry';

export interface AuditLogService {
  getAuditLog(entityId: string, entityType?: string): Promise<AuditLogEntry[]>;
  createAuditLog(entry: Omit<AuditLogEntry, 'id'>): Promise<AuditLogEntry>;
  getLatestAuditLogs(limit?: number): Promise<AuditLogEntry[]>;
  getLogs(entityType: string, entityId: string): Promise<AuditLogEntry[]>;
  getLogsByUserId(userId: string): Promise<AuditLogEntry[]>;
  getLogsByDateRange(startDate: string, endDate: string): Promise<AuditLogEntry[]>;
  createLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry>;
  getLogStats(entityType: string): Promise<{
    total: number;
    byAction: Record<string, number>;
    byUser: Record<string, number>;
  }>;
} 