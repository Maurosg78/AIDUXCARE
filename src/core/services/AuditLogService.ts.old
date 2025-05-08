import supabase from '@/core/lib/supabaseClient';

/**
 * Interfaz para eventos de auditoría
 */
export interface AuditLogEvent {
  id?: string;
  visitId: string;
  action: string;
  field: string;
  oldValue?: string;
  newValue?: string;
  modifiedBy: string;
  source: 'user' | 'copilot' | 'system';
  timestamp: string;
}

/**
 * Servicio para gestionar el registro de auditoría de cambios clínicos
 */
export class AuditLogService {
  /**
   * Registra un evento de auditoría
   */
  static async logEvent(eventData: AuditLogEvent): Promise<void> {
    const { error } = await supabase.from('audit_logs').insert({
      visit_id: eventData.visitId,
      action: eventData.action,
      field: eventData.field,
      old_value: eventData.oldValue,
      new_value: eventData.newValue,
      modified_by: eventData.modifiedBy,
      source: eventData.source,
      timestamp: new Date().toISOString()
    });

    if (error) {
      throw new Error(`Error al registrar evento de auditoría: ${error.message}`);
    }
  }

  /**
   * Obtiene todos los eventos de auditoría para una visita
   */
  static async getLogsByVisitId(visitId: string) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('visit_id', visitId)
      .order('timestamp', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener eventos de auditoría: ${error.message}`);
    }

    return data || [];
  }
} 