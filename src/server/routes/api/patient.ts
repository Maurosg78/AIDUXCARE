import { Router } from 'express';
import * as zod from '@/types/zod-utils';

// Definimos los esquemas directamente en este archivo
const PatientDataSchema = zod.z.object({
  id: zod.z.string(),
  name: zod.z.string(),
  birthDate: zod.z.string(),
  allergies: zod.z.array(zod.z.string()),
  chronicConditions: zod.z.array(zod.z.string()),
  medications: zod.z.array(zod.z.string())
});

const VisitSchema = zod.z.object({
  id: zod.z.string(),
  date: zod.z.string(),
  type: zod.z.string(),
  summary: zod.z.string(),
  professional: zod.z.string()
});

// Tipo inferido del esquema para uso en TypeScript
type Patient = {
  id: string;
  name: string;
  birthDate: string;
  allergies: string[];
  chronicConditions: string[];
  medications: string[];
};

type Visit = {
  id: string;
  date: string;
  type: string;
  summary: string;
  professional: string;
};

// Simulación de base de datos local
const mockDatabase = {
  patients: new Map<string, Patient>([
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
  visits: new Map<string, Visit[]>([
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

// Tipo para ZodError para cuando no tenemos acceso directo a la clase
interface ZodErrorType {
  errors: Array<{
    path: string[];
    message: string;
    code: string;
  }>;
}

// Función para verificar si un error es de tipo ZodError
function isZodError(error: unknown): error is ZodErrorType {
  return (
    typeof error === 'object' && 
    error !== null && 
    'errors' in error && 
    Array.isArray((error as any).errors)
  );
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
    const validatedVisits = zod.z.array(VisitSchema).parse(visits);

    res.json({
      patient: validatedPatient,
      visits: validatedVisits
    });
  } catch (error) {
    if (error instanceof PatientNotFoundError) {
      res.status(404).json({ error: error.message });
    } else if (isZodError(error)) {
      res.status(400).json({ 
        error: 'Datos inválidos en el EMR', 
        details: error.errors 
      });
    } else {
      console.error('Error al obtener datos del paciente:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
});

export default router; 