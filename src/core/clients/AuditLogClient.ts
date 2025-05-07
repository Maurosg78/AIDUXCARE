import supabase from '@/core/lib/supabaseClient';
import { AuditLogService, AuditLogEvent } from '@/core/services/AuditLogService';

export const AuditLogClient = {
  async getAuditLogByVisitId(visitId: string) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('visit_id', visitId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },
  
  async logEvent(eventData: AuditLogEvent): Promise<void> {
    return AuditLogService.logEvent(eventData);
  }
}

