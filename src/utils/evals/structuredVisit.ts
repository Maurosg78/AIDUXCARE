import { Langfuse } from 'langfuse-node';

// Modelo para los resultados de la evaluación
export interface EvalResult {
  patientId: string;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
}

// Interfaces para el trace de Langfuse
interface LangfuseObservation {
  name: string;
  input?: {
    field?: string;
    value?: unknown;
  };
}

interface LangfuseTrace {
  id: string;
  metadata?: {
    patientId?: string;
  };
  observations?: LangfuseObservation[];
}

// Extendemos la interfaz de Langfuse para incluir el método getTrace
interface ExtendedLangfuse extends Langfuse {
  getTrace?: (traceId: string) => Promise<LangfuseTrace>;
}

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
    check: (fields: Record<string, unknown>) => 
      fields.diagnosis && !fields.symptoms,
    message: 'Diagnóstico presente sin síntomas asociados'
  },
  {
    name: 'treatment_without_diagnosis',
    check: (fields: Record<string, unknown>) => 
      fields.treatmentPlan && !fields.diagnosis,
    message: 'Plan de tratamiento presente sin diagnóstico previo'
  },
  {
    name: 'prognosis_without_diagnosis',
    check: (fields: Record<string, unknown>) => 
      fields.prognosis && !fields.diagnosis,
    message: 'Pronóstico presente sin diagnóstico previo'
  }
];

// Función auxiliar para obtener un trace manualmente
async function fetchTrace(langfuse: ExtendedLangfuse, traceId: string): Promise<LangfuseTrace> {
  try {
    // Intentar usar el método getTrace si está disponible
    if (typeof langfuse.getTrace === 'function') {
      const trace = await langfuse.getTrace(traceId);
      if (trace) {
        return trace;
      }
    }
    
    // Fallback: usar la API REST
    const baseUrl = process.env.VITE_LANGFUSE_BASE_URL || 'https://cloud.langfuse.com';
    const publicKey = process.env.VITE_LANGFUSE_PUBLIC_KEY;
    const secretKey = process.env.LANGFUSE_SECRET_KEY;
    
    if (!publicKey || !secretKey) {
      throw new Error('Credenciales de Langfuse no configuradas');
    }
    
    const apiUrl = `${baseUrl}/api/public/traces/${traceId}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': `${publicKey}:${secretKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error al obtener trace: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error al obtener trace ${traceId}:`, error);
    throw error;
  }
}

export async function evaluatePatientVisit(
  langfuse: ExtendedLangfuse,
  traceId: string
): Promise<EvalResult> {
  try {
    // Obtener el trace específico usando nuestra función auxiliar
    const trace = await fetchTrace(langfuse, traceId);
    
    if (!trace) {
      throw new Error(`Trace no encontrado: ${traceId}`);
    }

    const patientId = trace.metadata?.patientId;
    if (!patientId) {
      throw new Error('Trace sin patientId en metadata');
    }

    // Recolectar todos los campos del formulario
    const formFields: Record<string, unknown> = {};
    (trace.observations || []).forEach((obs: {name: string; input?: {field?: string; value?: unknown}}) => {
      if (obs.name === 'form.update' && obs.input?.field) {
        formFields[obs.input.field] = obs.input.value;
      }
    });

    // Verificar campos críticos
    const missingFields = CRITICAL_FIELDS.filter(field => 
      !formFields[field] || String(formFields[field]).trim() === ''
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
      patientId: String(patientId),
      completenessScore,
      missingFields,
      warnings
    };
  } catch (error) {
    console.error('Error en evaluación:', error);
    // En caso de error, devolver un resultado vacío en lugar de propagar el error
    return {
      patientId: traceId,
      completenessScore: 0,
      missingFields: [],
      warnings: ['Error al procesar la evaluación']
    };
  }
} 