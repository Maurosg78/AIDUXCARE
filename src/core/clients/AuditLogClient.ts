import supabase from '@/core/lib/supabaseClient';
import { AuditLogService, type AuditLogEvent } from '@/core/services/AuditLogService';

/**
 * Cliente para interactuar con el servicio de logs de auditoría
 * Proporciona métodos para registrar eventos de auditoría clínica
 */
export class AuditLogClient {
  /**
   * Registra un evento en el log de auditoría
   * @param eventData Datos del evento a registrar
   */
  async logEvent(eventData: Omit<AuditLogEvent, 'id' | 'timestamp'>): Promise<void> {
    try {
      await AuditLogService.logEvent(eventData);
    } catch (error) {
      console.error('Error al registrar evento de auditoría:', error);
      throw error;
    }
  }

  async getAuditLogByVisitId(visitId: string) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('visit_id', visitId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }
}

