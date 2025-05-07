import { supabase } from '../lib/supabaseClient';
import { z } from 'zod';

export const AuditLogEventSchema = z.object({
  id: z.string().uuid(),
  visitId: z.string().uuid(),
  timestamp: z.string().datetime(),
  action: z.enum([
    'field_updated',
    'suggestion_accepted',
    'copilot_intervention',
    'manual_edit',
    'form_submitted',
  ]),
  field: z.string(),
  oldValue: z.string().optional(),
  newValue: z.string().optional(),
  modifiedBy: z.string(),
  source: z.enum(['user', 'copilot'])
});

export type AuditLogEvent = z.infer<typeof AuditLogEventSchema>;

export const AuditLogService = {
  async logEvent(event: Omit<AuditLogEvent, 'id' | 'timestamp'>): Promise<void> {
    // Insertar evento en Supabase
    const { error } = await supabase.from('audit_logs').insert({
      ...event,
      timestamp: new Date().toISOString(),
    });
    if (error) throw error;
  },

  async getLogsByVisitId(visitId: string): Promise<AuditLogEvent[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('visit_id', visitId)
      .order('timestamp', { ascending: true });
    if (error) throw error;
    // Validar y mapear los datos
    return (data ?? []).map((row) => {
      return AuditLogEventSchema.parse({
        id: row.id,
        visitId: row.visit_id,
        timestamp: row.timestamp,
        action: row.action,
        field: row.field,
        oldValue: row.old_value,
        newValue: row.new_value,
        modifiedBy: row.modified_by,
        source: row.source,
      });
    });
  },
}; 