import React from 'react';
import { render } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/dom';
import { ClinicalAuditLog } from './ClinicalAuditLog';
import * as AuditLogServiceModule from '@/core/services/AuditLogService';

const mockLogs = [
  {
    id: '1',
    visitId: 'visit-1',
    timestamp: new Date('2024-05-07T10:00:00Z').toISOString(),
    action: 'manual_edit' as const,
    field: 'motivo',
    oldValue: 'Dolor',
    newValue: 'Dolor lumbar',
    modifiedBy: 'doctor@aiduxcare.com',
    source: 'user' as const,
  },
  {
    id: '2',
    visitId: 'visit-1',
    timestamp: new Date('2024-05-07T11:00:00Z').toISOString(),
    action: 'ai_suggestion_accepted' as const,
    field: 'diagnostico',
    oldValue: undefined,
    newValue: 'Lumbalgia',
    modifiedBy: 'doctor@aiduxcare.com',
    source: 'copilot' as const,
  },
];

describe('ClinicalAuditLog', () => {
  it('renderiza los logs clínicos en la tabla', async () => {
    jest.spyOn(AuditLogServiceModule.AuditLogService, 'getLogsByVisitId').mockResolvedValueOnce(mockLogs);
    render(<ClinicalAuditLog visitId="visit-1" />);
    expect(document.querySelector('[role="progressbar"]')).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByText('Edición manual')).toBeTruthy();
      expect(screen.getByText('Sugerencia IA aceptada')).toBeTruthy();
      expect(screen.getByText('doctor@aiduxcare.com')).toBeTruthy();
    });
  });

  it('muestra mensaje de vacío si no hay logs', async () => {
    jest.spyOn(AuditLogServiceModule.AuditLogService, 'getLogsByVisitId').mockResolvedValueOnce([]);
    render(<ClinicalAuditLog visitId="visit-2" />);
    await waitFor(() => {
      expect(screen.getByText(/no hay eventos registrados/i)).toBeTruthy();
    });
  });

  it('muestra mensaje de error si falla la carga', async () => {
    jest.spyOn(AuditLogServiceModule.AuditLogService, 'getLogsByVisitId').mockRejectedValueOnce(new Error('fail'));
    render(<ClinicalAuditLog visitId="visit-3" />);
    await waitFor(() => {
      expect(screen.getByText(/error al cargar/i)).toBeTruthy();
    });
  });
}); 