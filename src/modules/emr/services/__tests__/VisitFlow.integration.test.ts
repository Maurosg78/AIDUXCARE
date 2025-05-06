import { describe, expect, it, vi, beforeEach } from 'vitest';
import { VisitService } from '../VisitService';
import { PaymentTracker } from '../PaymentTracker';

describe('Flujo de Visitas - Integración', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('debería manejar el flujo completo de agendamiento de visita', async () => {
    // Mock de datos de prueba
    const visitData = {
      patientId: '123',
      professionalId: '456',
      scheduledDate: '2024-03-21T15:00:00Z',
      previousHistory: false,
    };

    const createdVisit = {
      ...visitData,
      id: '789',
      status: 'pending',
      paymentStatus: 'pending',
    };

    const paymentRecord = {
      id: '999',
      visitId: '789',
      patientId: '123',
      amount: 0,
      status: 'pending',
      createdAt: '2024-03-21T14:00:00Z',
    };

    // Mock de respuestas de API
    (global.fetch as jest.Mock)
      // Crear visita
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createdVisit),
      })
      // Crear registro de pago
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(paymentRecord),
      })
      // Obtener visitas pendientes del profesional
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([createdVisit]),
      })
      // Obtener estado de pago
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(paymentRecord),
      });

    // 1. Agendar visita
    const visit = await VisitService.scheduleVisit(visitData);
    expect(visit).toEqual(createdVisit);

    // 2. Verificar que aparece en las visitas pendientes del profesional
    const pendingVisits = await VisitService.getProfessionalPendingVisits('456');
    expect(pendingVisits).toContainEqual(createdVisit);

    // 3. Verificar registro de pago
    const paymentTracker = new PaymentTracker();
    const paymentStatus = await paymentTracker.getPaymentStatus('789');
    expect(paymentStatus).toEqual(paymentRecord);

    // Verificar llamadas a la API
    expect(global.fetch).toHaveBeenCalledTimes(4);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/visits'),
      expect.any(Object)
    );
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/payments'),
      expect.any(Object)
    );
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/professionals/456/visits'),
      expect.any(Object)
    );
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/payments/visit/789'),
      expect.any(Object)
    );
  });

  it('debería permitir atención aunque el pago esté pendiente', async () => {
    const visitId = '789';
    const updateData = {
      status: 'completed',
      clinicalNotes: 'Atención realizada con éxito',
      diagnosis: 'Diagnóstico preliminar',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ...updateData, id: visitId }),
    });

    const updatedVisit = await VisitService.updateVisit(visitId, updateData);
    
    expect(updatedVisit).toEqual(expect.objectContaining(updateData));
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/visits/${visitId}`),
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify(updateData),
      })
    );
  });
}); 