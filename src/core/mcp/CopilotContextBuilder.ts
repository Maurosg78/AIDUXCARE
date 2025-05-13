import type { z  } from '@/types/zod-utils';
import { trackEvent } from '@/core/lib/langfuse.client';
import { VisitService } from '@/core/services/visit/VisitService';
import { ContextEnricher } from './ContextEnricher';
import type { PatientService as IPatientService  } from '@/core/types';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type * as PatientTypes from '@/core/services/patient/PatientService';

/**
 * Schema para validar el estado del paciente
 */
const PatientStateSchema = z.object({
  age: z.number(),
  sex: z.enumValues(['M', 'F', 'O'] as const),
  history: z.array(z.string())
});

/**
 * Schema para validar los metadatos de la visita
 */
const VisitMetadataSchema = z.object({
  visit_id: z.string(),
  date: z.string(),
  professional: z.string()
});

/**
 * Schema para validar el enriquecimiento de datos
 */
const EnrichmentSchema = z.object({
  similar_patients: z.array(z.string()),
  clinical_guidelines: z.array(z.string()),
  suggested_treatments: z.array(z.string()),
  risk_factors: z.array(z.string())
});

/**
 * Schema para validar el contexto MCP completo
 */
export const MCPContextSchema = z.object({
  patient_state: PatientStateSchema,
  visit_metadata: VisitMetadataSchema,
  rules_and_constraints: z.array(z.string()),
  system_instructions: z.string(),
  enrichment: EnrichmentSchema
});

/**
 * Tipos inferidos de los schemas
 */
export type PatientState = {
  age: number;
  sex: 'M' | 'F' | 'O';
  history: string[];
};

export type VisitMetadata = {
  visit_id: string;
  date: string;
  professional: string;
};

export type Enrichment = {
  similar_patients: string[];
  clinical_guidelines: string[];
  suggested_treatments: string[];
  risk_factors: string[];
};

export type MCPContext = {
  patient_state: PatientState;
  visit_metadata: VisitMetadata;
  rules_and_constraints: string[];
  system_instructions: string;
  enrichment: Enrichment;
};

interface BuilderInput {
  patientData: {
    age: number;
    sex: 'M' | 'F' | 'O';
    clinicalHistory: string[];
  };
  formState: {
    currentInput: string;
  };
  professional: {
    email: string;
  };
  visit: {
    id: string;
    date: Date;
    type: string;
  };
}

export class CopilotContextBuilder {
  private static DEFAULT_RULES = [
    "Respetar confidencialidad del paciente",
    "No realizar diagnósticos sin evidencia",
    "Sugerir solo tratamientos basados en evidencia",
    "Alertar sobre posibles contraindicaciones"
  ];

  private static DEFAULT_INSTRUCTIONS = `
    Actúa como un asistente clínico profesional.
    Observa y sugiere basándote en evidencia.
    Mantén un tono profesional y empático.
    No realices diagnósticos definitivos.
  `.trim();

  private enricher: ContextEnricher;
  private patientService: IPatientService;

  constructor(patientService: IPatientService) {
    this.enricher = new ContextEnricher(patientService);
    this.patientService = patientService;
  }

  // Función auxiliar para calcular edad a partir de fecha de nacimiento
  private calculateAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  async build(input: BuilderInput): Promise<MCPContext> {
    try {
      // Validar que la visita existe
      const visitExists = await VisitService.visitExists(input.visit.id);
      if (!visitExists) {
        await trackEvent('mcp_error', {
          reason: 'invalid_visit_id',
          visit_id: input.visit.id,
          timestamp: new Date().toISOString()
        });
        throw new Error('Visita no encontrada');
      }

      // Usar input directamente ya que contiene los datos básicos del paciente
      const patientAge = input.patientData.age;
      const patientSex = input.patientData.sex;
      const patientHistory = input.patientData.clinicalHistory;

      // Construir el contexto
      const context: MCPContext = {
        patient_state: {
          age: patientAge,
          sex: patientSex,
          history: patientHistory
        },
        visit_metadata: {
          visit_id: input.visit.id,
          date: input.visit.date.toISOString(),
          professional: input.professional.email
        },
        rules_and_constraints: CopilotContextBuilder.DEFAULT_RULES,
        system_instructions: CopilotContextBuilder.DEFAULT_INSTRUCTIONS,
        enrichment: {
          similar_patients: [],
          clinical_guidelines: [],
          suggested_treatments: [],
          risk_factors: []
        }
      };

      // Validar el contexto completo
      const validatedContext = MCPContextSchema.parse(context);

      // Registrar evento exitoso
      await trackEvent('mcp_context_built', {
        visit_id: input.visit.id,
        timestamp: new Date().toISOString()
      });

      return validatedContext;
    } catch (error) {
      // Registrar error
      await trackEvent('mcp_error', {
        reason: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }
}

/**
 * Construye el contexto para el MCP basado en los datos del paciente y la visita
 */
export async function buildMCPContext(patientId: string, visitId: string): Promise<MCPContext> {
  try {
    console.log('Construyendo contexto MCP para:', { patientId, visitId });
    
    // Obtener datos necesarios
    const visit = await getVisitData(visitId);
    
    // Crear contexto conforme al esquema
    const context: MCPContext = {
      patient_state: {
        age: 45, // TODO: Calcular desde fecha de nacimiento
        sex: 'M',
        history: ['Hipertensión', 'Diabetes tipo 2']
      },
      visit_metadata: {
        visit_id: visitId,
        date: visit?.date || new Date().toISOString(),
        professional: visit?.professionalId || 'unknown'
      },
      rules_and_constraints: [
        'No recomendar medicamentos con interacciones conocidas',
        'Verificar alergias antes de sugerir tratamientos',
        'Priorizar tratamientos basados en evidencia'
      ],
      system_instructions: 'Proporcionar asistencia clínica respetando las directrices médicas y considerando el historial completo del paciente.',
      enrichment: {
        similar_patients: [],
        clinical_guidelines: [],
        suggested_treatments: [],
        risk_factors: []
      }
    };
    
    return context;
  } catch (error) {
    console.error('Error al construir contexto MCP:', error);
    throw new Error('No se pudo construir el contexto para el MCP');
  }
}

/**
 * Función auxiliar para obtener datos de visita
 */
async function getVisitData(visitId: string) {
  try {
    return await VisitService.getVisitById(visitId);
  } catch {
    return null;
  }
} 