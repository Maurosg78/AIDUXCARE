import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AuditLogViewer from './AuditLogViewer';
import { AuditLogService } from '@/core/services/audit/AuditLogService';

// Mock del servicio de auditoría
jest.mock('@/core/services/audit/AuditLogService', () => ({
  AuditLogService: {
    getLogsByVisitId: jest.fn(),
  },
  AuditLogEventSchema: {}, // Mock del schema
}));

const mockAuditLogs = [
  {
    id: '1',
    visitId: 'visit-123',
    timestamp: new Date().toISOString(),
    action: 'field_updated',
    field: 'motivo',
    oldValue: 'Dolor',
    newValue: 'Dolor lumbar',
    modifiedBy: 'doctor@example.com',
    source: 'user',
  },
  {
    id: '2',
    visitId: 'visit-123',
    timestamp: new Date().toISOString(),
    action: 'ai_suggestion_accepted',
    field: 'diagnostico',
    newValue: 'Lumbalgia',
    modifiedBy: 'doctor@example.com',
    source: 'copilot',
  },
];

describe('AuditLogViewer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('muestra los registros de auditoría correctamente', async () => {
    // Configurar el mock para devolver datos de prueba
    (AuditLogService.getLogsByVisitId as jest.Mock).mockResolvedValue(mockAuditLogs);

    render(
      <MemoryRouter initialEntries={['/visits/visit-123/audit-log']}>
        <Routes>
          <Route path="/visits/:visitId/audit-log" element={<AuditLogViewer />} />
        </Routes>
      </MemoryRouter>
    );

    // Verificar estado de carga
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(AuditLogService.getLogsByVisitId).toHaveBeenCalledWith('visit-123');
      expect(screen.getByText('Registro de Auditoría Clínica')).toBeInTheDocument();
      expect(screen.getByText('Campo actualizado')).toBeInTheDocument();
      expect(screen.getByText('Sugerencia IA aceptada')).toBeInTheDocument();
      expect(screen.getByText('doctor@example.com')).toBeInTheDocument();
    });
  });

  test('muestra mensaje cuando no hay registros', async () => {
    // Configurar el mock para devolver un array vacío
    (AuditLogService.getLogsByVisitId as jest.Mock).mockResolvedValue([]);

    render(
      <MemoryRouter initialEntries={['/visits/visit-empty/audit-log']}>
        <Routes>
          <Route path="/visits/:visitId/audit-log" element={<AuditLogViewer />} />
        </Routes>
      </MemoryRouter>
    );

    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.getByText('No hay registros de auditoría que coincidan con los filtros seleccionados.')).toBeInTheDocument();
    });
  });

  test('muestra mensaje de error cuando falla la carga', async () => {
    // Configurar el mock para lanzar un error
    (AuditLogService.getLogsByVisitId as jest.Mock).mockRejectedValue(new Error('Error de carga'));

    render(
      <MemoryRouter initialEntries={['/visits/visit-error/audit-log']}>
        <Routes>
          <Route path="/visits/:visitId/audit-log" element={<AuditLogViewer />} />
        </Routes>
      </MemoryRouter>
    );

    // Esperar a que se muestre el error
    await waitFor(() => {
      expect(screen.getByText('Error de carga')).toBeInTheDocument();
    });
  });
}); 