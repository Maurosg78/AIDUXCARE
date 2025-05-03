import { Langfuse } from 'langfuse-node';
import { EvalResult } from '@/types/Evaluation';

// Campos críticos que deben estar presentes
export const CRITICAL_FIELDS = [
  'chiefComplaint',
  'symptoms',
  'diagnosis',
  'treatmentPlan',
  'prognosis',
  'followUp'
];

// Reglas de consistencia
export const CONSISTENCY_RULES = [
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

export async function evaluatePatientVisit(
  langfuse: Langfuse,
  traceId: string
): Promise<EvalResult> {
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