import { describe, expect, it, beforeEach } from 'vitest';
import { VisitService } from '../VisitService';
import { PatientService } from '../PatientService';
import { PaymentTracker } from '../PaymentTracker';
import '../__tests__/setup';

describe('Caso Clínico: Andreina Saade', () => {
  const PROFESSIONAL_EMAIL = 'mauricio@axonvalencia.es';
  const PROFESSIONAL_ID = '123e4567-e89b-12d3-a456-426614174001';
  const TOMORROW_10AM = new Date();
  TOMORROW_10AM.setDate(TOMORROW_10AM.getDate() + 1);
  TOMORROW_10AM.setHours(10, 0, 0, 0);

  beforeEach(() => {
    localStorage.clear();
  });

  it('debería crear y recuperar correctamente la visita de Andreina Saade', async () => {
    // 1. Datos de la paciente
    const pacienteData = {
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
      professionalId: PROFESSIONAL_ID,
      professionalEmail: PROFESSIONAL_EMAIL,
      scheduledDate: TOMORROW_10AM.toISOString(),
      duration: 45,
      motivo: 'Dolor lumbar persistente',
      modalidad: 'presencial',
      precio: 35,
      paymentStatus: 'paid',
      status: 'scheduled',
      previousHistory: false,
    };

    // 3. Crear paciente
    const patient = await PatientService.createPatient(pacienteData);
    expect(patient).toEqual(expect.objectContaining(pacienteData));

    // 4. Crear visita
    const visit = await VisitService.scheduleVisit({
      ...visitaData,
      patientId: patient.id,
    });

    expect(visit).toEqual(expect.objectContaining({
      ...visitaData,
      patientId: patient.id,
      id: expect.any(String),
    }));

    // 5. Verificar pago
    const paymentTracker = new PaymentTracker();
    const payment = await paymentTracker.getPaymentStatus(visit.id);
    expect(payment).toEqual(expect.objectContaining({
      visitId: visit.id,
      patientId: patient.id,
      amount: 35,
      status: 'paid',
    }));

    // 6. Verificar que aparece en las visitas del profesional
    const professionalVisits = await VisitService.getProfessionalVisits(PROFESSIONAL_EMAIL);
    const andreinaVisit = professionalVisits.find(v => v.id === visit.id);
    expect(andreinaVisit).toBeTruthy();
    expect(andreinaVisit).toEqual(expect.objectContaining({
      patientId: patient.id,
      scheduledDate: TOMORROW_10AM.toISOString(),
      motivo: 'Dolor lumbar persistente',
      paymentStatus: 'paid',
    }));

    // 7. Verificar que se puede actualizar el estado
    const updatedVisit = await VisitService.updateVisit(visit.id, {
      status: 'in_progress',
    });
    expect(updatedVisit.status).toBe('in_progress');
  });
}); 