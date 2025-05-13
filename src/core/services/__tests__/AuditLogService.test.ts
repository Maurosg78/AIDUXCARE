import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuditLogService } from '../AuditLogService';

vi.mock('@/core/lib/supabaseClient', () => ({
  default: {
    from: vi.fn(() => ({
      insert: vi.fn().mockReturnValue({ error: null }),
      select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnThis(), order: vi.fn().mockReturnValue({ data: [], error: null }) })
    }))
  }
}));

describe('AuditLogService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logEvent inserta correctamente', async () => {
    await expect(AuditLogService.logEvent({
      visitId: '00000000-0000-0000-0000-000000000001',
      action: 'field_updated',
      field: 'motivo',
      oldValue: 'Dolor',
      newValue: 'Dolor lumbar',
      modifiedBy: 'doctor@aiduxcare.com',
      source: 'user'
    })).resolves.toBeUndefined();
  });

  it('getLogsByVisitId retorna array vacío si no hay datos', async () => {
    const logs = await AuditLogService.getLogsByVisitId('00000000-0000-0000-0000-000000000001');
    expect(Array.isArray(logs)).toBe(true);
    expect(logs.length).toBe(0);
  });

  it('logEvent IA accepted', async () => {
    await expect(AuditLogService.logEvent({
      visitId: '00000000-0000-0000-0000-000000000002',
      action: 'ai_suggestion_accepted',
      field: 'diagnostico',
      newValue: 'Lumbalgia',
      modifiedBy: 'doctor@aiduxcare.com',
      source: 'copilot'
    })).resolves.toBeUndefined();
  });

  it('logEvent IA modified', async () => {
    await expect(AuditLogService.logEvent({
      visitId: '00000000-0000-0000-0000-000000000002',
      action: 'ai_suggestion_modified',
      field: 'diagnostico',
      oldValue: 'Lumbalgia',
      newValue: 'Lumbalgia aguda',
      modifiedBy: 'doctor@aiduxcare.com',
      source: 'copilot'
    })).resolves.toBeUndefined();
  });

  it('logEvent IA rejected', async () => {
    await expect(AuditLogService.logEvent({
      visitId: '00000000-0000-0000-0000-000000000002',
      action: 'ai_suggestion_rejected',
      field: 'diagnostico',
      oldValue: 'Lumbalgia',
      modifiedBy: 'doctor@aiduxcare.com',
      source: 'copilot'
    })).resolves.toBeUndefined();
  });
}); 