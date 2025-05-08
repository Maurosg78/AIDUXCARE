import { Router } from 'express';
import { z } from 'zod';
import { PatientSchema } from '../../../core/services/patient/PatientService';

// Simulación de base de datos local
const mockDatabase = {
  patients: new Map([
    ['p1', {
      id: 'p1',
      name: 'Juan García López',
      birthDate: '1975-08-15T00:00:00Z',
      allergies: ['Penicilina', 'Sulfas'],
      chronicConditions: ['Hipertensión Arterial', 'Diabetes Mellitus tipo 2'],
      medications: ['Metformina 850mg', 'Enalapril 10mg']
    }],
    ['p2', {
      id: 'p2',
      name: 'María Rodríguez Sánchez',
      birthDate: '1982-03-21T00:00:00Z',
      allergies: ['AINES'],
      chronicConditions: ['Asma'],
      medications: ['Salbutamol inhalador']
    }]
  ]),
  visits: new Map([
    ['p1', [
      {
        id: 'v1',
        date: '2024-03-01T10:00:00Z',
        type: 'Control Crónico',
        summary: 'Paciente estable. HTA controlada. Ajuste de dosis de metformina.',
        professional: 'dr.garcia@aiduxcare.com'
      },
      {
        id: 'v2',
        date: '2024-02-01T15:30:00Z',
        type: 'Control Diabetes',
        summary: 'HbA1c 6.8%. Continuar mismo esquema.',
        professional: 'dr.rodriguez@aiduxcare.com'
      }
    ]],
    ['p2', [
      {
        id: 'v3',
        date: '2024-03-10T09:00:00Z',
        type: 'Control Asma',
        summary: 'Buen control de síntomas. Mantener tratamiento.',
        professional: 'dr.garcia@aiduxcare.com'
      }
    ]]
  ])
};

class PatientNotFoundError extends Error {
  constructor(patientId: string) {
    super(`Paciente con ID ${patientId} no encontrado`);
    this.name = 'PatientNotFoundError';
  }
}

const router = Router();

router.get('/:id', async (req, res) => {
  try {
    const patientId = req.params.id;
    const patient = mockDatabase.patients.get(patientId);
    
    if (!patient) {
      throw new PatientNotFoundError(patientId);
    }

    // Validar datos del paciente
    const validatedPatient = PatientDataSchema.parse(patient);
    
    // Obtener y validar visitas
    const visits = mockDatabase.visits.get(patientId) || [];
    const validatedVisits = z.array(VisitSchema).parse(visits);

    res.json({
      patient: validatedPatient,
      visits: validatedVisits
    });
  } catch (error) {
    if (error instanceof PatientNotFoundError) {
      res.status(404).json({ error: error.message });
    } else if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Datos inválidos en el EMR', details: error.errors });
    } else {
      console.error('Error al obtener datos del paciente:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
});

export default router; 