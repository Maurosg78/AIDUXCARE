import { describe, expect, it, vi, beforeEach } from 'vitest';
import { VisitService, VisitServiceError, VisitErrorCodes } from '../VisitService';

describe('VisitService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('scheduleVisit', () => {
    it('debería validar y crear una visita correctamente', async () => {
      const validVisitData = {
        patientId: '123e4567-e89b-12d3-a456-426614174000',
        professionalId: '123e4567-e89b-12d3-a456-426614174001',
        scheduledDate: '2024-03-21T15:00:00Z',
        previousHistory: false,
      };

      const createdVisit = {
        ...validVisitData,
        id: '123e4567-e89b-12d3-a456-426614174002',
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: '2024-03-21T15:00:00Z',
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(createdVisit),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: 'payment-123' }),
        });

      const result = await VisitService.scheduleVisit(validVisitData);
      expect(result).toEqual(createdVisit);
    });

    it('debería rechazar datos inválidos', async () => {
      const invalidVisitData = {
        patientId: '', // ID inválido
        professionalId: '123',
        scheduledDate: 'fecha-invalida',
        previousHistory: false,
      };

      await expect(VisitService.scheduleVisit(invalidVisitData)).rejects.toThrow(
        VisitServiceError
      );
    });
  });

  describe('updateVisit', () => {
    it('debería validar y actualizar una visita correctamente', async () => {
      const visitId = '123e4567-e89b-12d3-a456-426614174000';
      const updateData = {
        status: 'completed' as const,
        clinicalNotes: 'Actualización de notas',
      };

      const updatedVisit = {
        id: visitId,
        ...updateData,
        updatedAt: '2024-03-21T16:00:00Z',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(updatedVisit),
      });

      const result = await VisitService.updateVisit(visitId, updateData);
      expect(result).toEqual(updatedVisit);
    });

    it('debería manejar errores de API correctamente', async () => {
      const visitId = '123e4567-e89b-12d3-a456-426614174000';
      const updateData = {
        status: 'completed' as const,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(VisitService.updateVisit(visitId, updateData))
        .rejects.toThrow(VisitServiceError);
    });
  });

  describe('getProfessionalPendingVisits', () => {
    it('debería obtener y validar visitas pendientes', async () => {
      const professionalId = '123e4567-e89b-12d3-a456-426614174000';
      const pendingVisits = [
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          patientId: '123e4567-e89b-12d3-a456-426614174002',
          professionalId,
          scheduledDate: '2024-03-21T15:00:00Z',
          status: 'pending',
          previousHistory: false,
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(pendingVisits),
      });

      const result = await VisitService.getProfessionalPendingVisits(professionalId);
      expect(result).toEqual(pendingVisits);
    });

    it('debería manejar errores de red', async () => {
      const professionalId = '123e4567-e89b-12d3-a456-426614174000';

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(
        VisitService.getProfessionalPendingVisits(professionalId)
      ).rejects.toThrow(VisitServiceError);
    });
  });
}); 