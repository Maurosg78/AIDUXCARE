import { describe, expect, it, vi, beforeEach } from 'vitest';
import { VisitService } from '../VisitService';
import { PatientService } from '../PatientService';
import { PaymentTracker } from '../PaymentTracker';

describe('Flujo de Visita - Caso Andreina Saade', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    localStorage.clear();
  });

  it('debería manejar el flujo completo de registro y agendamiento', async () => {
    // 1. Datos de la paciente
    const pacienteData = {
      nombre: 'Andreina Saade',
      edad: 42,
      fechaNacimiento: '1982-03-20',
      genero: 'femenino' as const,
      telefono: '+34600000000',
      email: 'andreina.saade@email.com',
      seguroMedico: false,
    };

    // 2. Datos de la visita
    const visitaData = {
      patientId: '123e4567-e89b-12d3-a456-426614174000',
      professionalId: '123e4567-e89b-12d3-a456-426614174001',
      professionalEmail: 'dra.garcia@axonvalencia.es',
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      duration: 45,
      motivo: 'Dolor lumbar persistente',
      modalidad: 'presencial' as const,
      precio: 35,
      paymentStatus: 'paid' as const,
      previousHistory: false,
      metadata: {
        visit_type: 'primera_visita',
        duration_minutes: 45,
        location: 'Consulta 1',
        follow_up_required: true
      }
    };

    // 1. Registrar paciente
    const patient = await PatientService.createPatient(pacienteData);
    expect(patient).toHaveProperty('id');
    expect(patient.nombre).toBe(pacienteData.nombre);

    // 2. Agendar visita
    const visit = await VisitService.scheduleVisit({
      ...visitaData,
      patientId: patient.id
    });

    expect(visit).toMatchObject({
      patientId: patient.id,
      professionalEmail: visitaData.professionalEmail,
      status: 'scheduled',
      paymentStatus: 'paid',
      motivo: visitaData.motivo
    });

    // 3. Verificar que aparece en las visitas del profesional
    const professionalVisits = await VisitService.getProfessionalPendingVisits(visitaData.professionalEmail);
    expect(professionalVisits).toContainEqual(expect.objectContaining({
      id: visit.id,
      patientId: patient.id,
      status: 'scheduled'
    }));

    // 4. Verificar registro de pago
    const paymentTracker = new PaymentTracker();
    const paymentStatus = await paymentTracker.getPaymentStatus(visit.id);
    expect(paymentStatus).toMatchObject({
      visitId: visit.id,
      patientId: patient.id,
      amount: visitaData.precio,
      status: 'paid'
    });
  });

  it('debería permitir acceder a la ficha clínica independientemente del estado de pago', async () => {
    const visitData = {
      patientId: '123e4567-e89b-12d3-a456-426614174000',
      professionalId: '123e4567-e89b-12d3-a456-426614174001',
      professionalEmail: 'dra.garcia@axonvalencia.es',
      scheduledDate: new Date().toISOString(),
      duration: 45,
      motivo: 'Dolor lumbar persistente',
      modalidad: 'presencial' as const,
      precio: 35,
      paymentStatus: 'pending' as const,
      previousHistory: false,
      metadata: {
        visit_type: 'primera_visita',
        duration_minutes: 45,
        location: 'Consulta 1',
        follow_up_required: true
      }
    };

    // Crear visita
    const createdVisit = await VisitService.scheduleVisit(visitData);
    expect(createdVisit).toHaveProperty('id');

    // Obtener visita
    const visit = await VisitService.getVisitById(createdVisit.id);
    expect(visit).toBeDefined();
    expect(visit).toMatchObject({
      id: createdVisit.id,
      status: 'scheduled',
      paymentStatus: 'pending'
    });
  });
}); 