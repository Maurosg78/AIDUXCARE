import { supabase } from '@/core/lib/supabase';
import { getCurrentUserId } from '@/core/utils/auth';
import type { AuditLogEvent as AuditLogEventType } from '@/core/types';

/**
 * Servicio para gestionar logs de auditoría
 */
export class AuditLogServiceImpl {
  /**
   * Registra un evento de auditoría en la base de datos
   */
  async logEvent(eventData: Omit<AuditLogEventType, 'id' | 'timestamp'>): Promise<void> {
    try {
      const userId = eventData.userId || (await getCurrentUserId()) || 'unknown';
      
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          action: eventData.action,
          resource: eventData.resource,
          resource_id: eventData.resourceId,
          details: eventData.details || {},
          timestamp: new Date().toISOString()
        });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error al registrar log de auditoría:', error);
      throw error;
    }
  }

  /**
   * Obtiene los logs de auditoría filtrados por recurso y/o usuario
   */
  async getAuditLogs(
    options: {
      resourceType?: string;
      resourceId?: string;
      userId?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<AuditLogEventType[]> {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (options.resourceType) {
        query = query.eq('resource', options.resourceType);
      }
      
      if (options.resourceId) {
        query = query.eq('resource_id', options.resourceId);
      }
      
      if (options.userId) {
        query = query.eq('user_id', options.userId);
      }
      
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data ?? [];
    } catch (error) {
      console.error('Error al obtener logs de auditoría:', error);
      throw error;
    }
  }
}

// Instancia del servicio para uso en la aplicación
export const AuditLogService = new AuditLogServiceImpl(); 