import { Langfuse } from 'langfuse-node';
import { PatientEval } from '../src/types/Evaluation';

const langfuse = new Langfuse({
  publicKey: process.env.VITE_LANGFUSE_PUBLIC_KEY || '',
  secretKey: process.env.VITE_LANGFUSE_SECRET_KEY || '',
  baseUrl: process.env.VITE_LANGFUSE_HOST || 'https://cloud.langfuse.com'
});

interface EvalResult {
  patientId: string;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
}

// Campos críticos que deben estar presentes
const CRITICAL_FIELDS = [
  'chiefComplaint',
  'symptoms',
  'diagnosis',
  'treatmentPlan',
  'prognosis',
  'followUp'
];

// Reglas de consistencia
const CONSISTENCY_RULES = [
  {
    name: 'diagnosis_without_symptoms',
    check: (fields: Record<string, any>) => 
      fields.diagnosis && !fields.symptoms,
    message: 'Diagnóstico presente sin síntomas asociados'
  },
  {
    name: 'treatment_without_diagnosis',
    check: (fields: Record<string, any>) => 
      fields.treatmentPlan && !fields.diagnosis,
    message: 'Plan de tratamiento presente sin diagnóstico previo'
  },
  {
    name: 'prognosis_without_diagnosis',
    check: (fields: Record<string, any>) => 
      fields.prognosis && !fields.diagnosis,
    message: 'Pronóstico presente sin diagnóstico previo'
  }
];

async function evaluatePatientVisit(traceId: string): Promise<EvalResult> {
  try {
    // Obtener el trace específico
    const trace = await langfuse.getTrace(traceId);
    if (!trace) {
      throw new Error(`Trace no encontrado: ${traceId}`);
    }

    const patientId = trace.metadata?.patientId;
    if (!patientId) {
      throw new Error('Trace sin patientId en metadata');
    }

    // Recolectar todos los campos del formulario
    const formFields: Record<string, any> = {};
    trace.observations?.forEach(obs => {
      if (obs.name === 'form.update' && obs.input?.field) {
        formFields[obs.input.field] = obs.input.value;
      }
    });

    // Verificar campos críticos
    const missingFields = CRITICAL_FIELDS.filter(field => 
      !formFields[field] || formFields[field].trim() === ''
    );

    // Verificar reglas de consistencia
    const warnings = CONSISTENCY_RULES
      .filter(rule => rule.check(formFields))
      .map(rule => rule.message);

    // Calcular score de completitud
    const completenessScore = Math.round(
      ((CRITICAL_FIELDS.length - missingFields.length) / CRITICAL_FIELDS.length) * 100
    );

    return {
      patientId,
      completenessScore,
      missingFields,
      warnings
    };
  } catch (error) {
    console.error('Error en evaluación:', error);
    throw error;
  }
}

describe('Evaluaciones de Visitas Estructuradas', () => {
  let testTraceId: string;

  beforeAll(async () => {
    // Obtener un trace real para pruebas
    const traces = await langfuse.getTraces({
      limit: 1,
      name: 'form.update'
    });
    
    if (traces.data.length > 0) {
      testTraceId = traces.data[0].id;
    } else {
      throw new Error('No se encontraron traces para pruebas');
    }
  });

  test('debe detectar campos faltantes', async () => {
    const result = await evaluatePatientVisit(testTraceId);
    
    expect(result).toHaveProperty('patientId', 'test-patient-id');
    expect(result).toHaveProperty('completenessScore');
    expect(result).toHaveProperty('missingFields');
    expect(result).toHaveProperty('warnings');
    
    // Verificar que el score es 50% (3 campos presentes de 6)
    expect(result.completenessScore).toBe(50);
    
    // Verificar que faltan los campos esperados
    expect(result.missingFields).toContain('treatmentPlan');
    expect(result.missingFields).toContain('prognosis');
    expect(result.missingFields).toContain('followUp');
    
    expect(Array.isArray(result.warnings)).toBe(true);
  });

  test('debe detectar inconsistencias en los datos', async () => {
    const result = await evaluatePatientVisit(testTraceId);
    
    // Verificar que no hay advertencias ya que los datos son consistentes
    expect(result.warnings).toHaveLength(0);
  });

  test('debe calcular correctamente el score de completitud', async () => {
    const result = await evaluatePatientVisit(testTraceId);
    
    // El score debe ser 50% (3 campos presentes de 6)
    expect(result.completenessScore).toBe(50);
    
    // Verificar que el número de campos faltantes es correcto
    expect(result.missingFields).toHaveLength(3);
  });
}); 