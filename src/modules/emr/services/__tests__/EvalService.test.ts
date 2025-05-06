import { EvalService, EvalServiceError } from '../EvalService';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('EvalService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('getPatientEvals', () => {
    it('debería manejar correctamente una respuesta HTML en lugar de JSON', async () => {
      const mockResponse = new Response(
        '<!DOCTYPE html><html><body>Error Page</body></html>',
        {
          status: 200,
          headers: { 'content-type': 'text/html' }
        }
      );

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      await expect(EvalService.getPatientEvals('123')).rejects.toThrow(
        new EvalServiceError('Respuesta no válida: Se esperaba JSON', 'INVALID_CONTENT_TYPE')
      );
    });

    it('debería validar correctamente la estructura de datos', async () => {
      const validData = [{
        id: '1',
        patientId: '123',
        visitDate: '2024-03-20',
        motivo: 'Control',
        observaciones: 'Sin novedad',
        diagnostico: 'Saludable',
        alertas: ['Ninguna'],
        feedback: [{
          type: 'suggestion',
          severity: 'info',
          message: 'Todo bien'
        }]
      }];

      const mockResponse = new Response(JSON.stringify(validData), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await EvalService.getPatientEvals('123');
      expect(result).toEqual(validData);
    });

    it('debería rechazar datos con estructura inválida', async () => {
      const invalidData = [{
        id: '1',
        // Falta patientId y otros campos requeridos
      }];

      const mockResponse = new Response(JSON.stringify(invalidData), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      await expect(EvalService.getPatientEvals('123')).rejects.toThrow(
        new EvalServiceError('Datos de evaluación inválidos', 'VALIDATION_ERROR')
      );
    });

    it('debería reintentar en caso de error de red', async () => {
      const networkError = new Error('Network error');
      const validData = [{
        id: '1',
        patientId: '123',
        visitDate: '2024-03-20',
        motivo: 'Control',
        observaciones: 'Sin novedad',
        diagnostico: 'Saludable',
        alertas: ['Ninguna'],
        feedback: [{
          type: 'suggestion',
          severity: 'info',
          message: 'Todo bien'
        }]
      }];

      const mockResponse = new Response(JSON.stringify(validData), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });

      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(networkError)
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce(mockResponse);

      const result = await EvalService.getPatientEvals('123');
      expect(result).toEqual(validData);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });
}); 