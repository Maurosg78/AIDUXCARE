import { describe, expect, it, beforeEach } from 'vitest';
import { VisitService } from '../VisitService';
import { PatientService } from '../PatientService';

describe('Flujo de Visitas - Integración', () => {
  beforeEach(async () => {
    await VisitService.clearAll();
    await PatientService.clearAll();
  });

  it('debería manejar el flujo completo de agendamiento de visita', async () => {
    // 1. Crear paciente
    const patientData = {
      nombre: 'Juan Pérez',
      edad: 35,
      fechaNacimiento: '1988-05-15',
      genero: 'masculino' as const,
      telefono: '+34600000000',
      email: 'juan.perez@email.com',
      seguroMedico: false
    };

    const patient = await PatientService.createPatient(patientData);
    expect(patient).toHaveProperty('id');

    // 2. Crear visita
    const visitData = {
      patientId: patient.id,
      professionalId: 'prof-123',
      professionalEmail: 'doctor@hospital.com',
      scheduledDate: new Date().toISOString(),
      duration: 30,
      status: 'scheduled' as const,
      paymentStatus: 'pending' as const,
      motivo: 'Consulta general',
      modalidad: 'presencial' as const,
      metadata: {
        visit_type: 'primera_visita',
        duration_minutes: 30,
        location: 'Consulta 1',
        follow_up_required: false
      }
    };

    const visit = await VisitService.scheduleVisit(visitData);
    expect(visit).toMatchObject({
      patientId: patient.id,
      professionalEmail: visitData.professionalEmail,
      status: 'scheduled',
      paymentStatus: 'pending'
    });

    // 3. Verificar que la visita existe
    const retrievedVisit = await VisitService.getVisitById(visit.id);
    expect(retrievedVisit).toBeDefined();
    expect(retrievedVisit?.patientId).toBe(patient.id);

    // 4. Actualizar estado de la visita
    const updatedVisit = await VisitService.updateVisit(visit.id, {
      status: 'completed',
      paymentStatus: 'paid',
      notes: 'Visita completada con éxito'
    });

    expect(updatedVisit.status).toBe('completed');
    expect(updatedVisit.paymentStatus).toBe('paid');
    expect(updatedVisit.notes).toBe('Visita completada con éxito');
  });
}); 