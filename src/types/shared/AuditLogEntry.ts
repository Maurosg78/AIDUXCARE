/**
 * Tipos relacionados con auditoría
 */

export type AuditAction = 
  | 'create'
  | 'update'
  | 'delete'
  | 'view'
  | 'export'
  | 'import'
  | 'approve'
  | 'reject'
  | 'comment';

/**
 * Representa un cambio en un campo específico
 */
export interface ChangeRecord<T = unknown> {
  field: string;
  oldValue: T;
  newValue: T;
  timestamp: string;
}

/**
 * Representa una entrada en el log de auditoría
 */
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  changes: ChangeRecord[];
  metadata?: {
    ip?: string;
    userAgent?: string;
    [key: string]: unknown;
  };
} 