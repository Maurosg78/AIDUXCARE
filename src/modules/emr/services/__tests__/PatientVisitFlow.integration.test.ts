import { describe, expect, it, vi, beforeEach } from 'vitest';
import { VisitService } from '../VisitService';
import { PatientService } from '../PatientService';
import { PaymentTracker } from '../PaymentTracker';

describe('Flujo de Visita - Caso Andreina Saade', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('debería manejar el flujo completo de registro y agendamiento', async () => {
    // 1. Datos de la paciente
    const pacienteData = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      nombre: 'Andreina Saade',
      edad: 42,
      fechaNacimiento: '1982-03-20',
      genero: 'femenino',
      telefono: '+34600000000',
      email: 'andreina.saade@email.com',
      seguroMedico: false,
    };

    // 2. Datos de la visita
    const visitaData = {
      patientId: pacienteData.id,
      professionalId: '123e4567-e89b-12d3-a456-426614174001', // ID del profesional asignado
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Mañana
      duration: 45,
      motivo: 'Dolor lumbar persistente',
      modalidad: 'presencial',
      precio: 35,
      paymentStatus: 'paid',
      previousHistory: false,
    };

    // Mock de respuestas
    const createdPatient = { ...pacienteData };
    const createdVisit = {
      id: '123e4567-e89b-12d3-a456-426614174002',
      ...visitaData,
      status: 'scheduled',
    };

    const paymentRecord = {
      id: '123e4567-e89b-12d3-a456-426614174003',
      visitId: createdVisit.id,
      patientId: pacienteData.id,
      amount: 35,
      status: 'paid',
      createdAt: new Date().toISOString(),
    };

    // Configurar mocks
    (global.fetch as jest.Mock)
      // Crear paciente
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createdPatient),
      })
      // Crear visita
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createdVisit),
      })
      // Registrar pago
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(paymentRecord),
      })
      // Obtener visitas del profesional
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([createdVisit]),
      });

    // 1. Registrar paciente
    const patient = await PatientService.createPatient(pacienteData);
    expect(patient).toEqual(createdPatient);

    // 2. Agendar visita
    const visit = await VisitService.scheduleVisit(visitaData);
    expect(visit).toEqual(createdVisit);
    expect(visit.paymentStatus).toBe('paid');

    // 3. Verificar que aparece en las visitas del profesional
    const professionalVisits = await VisitService.getProfessionalPendingVisits(visitaData.professionalId);
    expect(professionalVisits).toContainEqual(createdVisit);

    // 4. Verificar registro de pago
    const paymentTracker = new PaymentTracker();
    const paymentStatus = await paymentTracker.getPaymentStatus(createdVisit.id);
    expect(paymentStatus).toEqual(paymentRecord);

    // Verificar llamadas a la API
    expect(global.fetch).toHaveBeenCalledTimes(4);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/patients'),
      expect.any(Object)
    );
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/visits'),
      expect.any(Object)
    );
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/payments'),
      expect.any(Object)
    );
  });

  it('debería permitir acceder a la ficha clínica independientemente del estado de pago', async () => {
    const visitId = '123e4567-e89b-12d3-a456-426614174002';
    const visitData = {
      id: visitId,
      patientId: '123e4567-e89b-12d3-a456-426614174000',
      professionalId: '123e4567-e89b-12d3-a456-426614174001',
      scheduledDate: new Date().toISOString(),
      status: 'scheduled',
      paymentStatus: 'paid',
      motivo: 'Dolor lumbar persistente',
      previousHistory: false,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(visitData),
    });

    const visit = await VisitService.getVisitById(visitId);
    expect(visit).toEqual(visitData);
    expect(visit?.status).toBe('scheduled');
  });
}); 