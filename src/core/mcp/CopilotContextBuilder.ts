import { z } from 'zod';
import { trackEvent } from '@/core/lib/langfuse.client';
import { VisitService } from '@/core/services/visit/VisitService';
import { ContextEnricher } from './ContextEnricher';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type * as PatientTypes from '@/core/services/patient/PatientService';

/**
 * Schema para validar el estado del paciente
 */
export const PatientStateSchema = z.object({
  age: z.number(),
  sex: z.enum(['M', 'F', 'O']),
  history: z.array(z.string())
});

/**
 * Schema para validar los metadatos de la visita
 */
export const VisitMetadataSchema = z.object({
  visit_id: z.string().uuid(),
  date: z.string().datetime(),
  professional: z.string().email()
});

/**
 * Schema para validar el enriquecimiento de datos
 */
export const EnrichmentSchema = z.object({
  emr: z.object({
    patient_data: z.object({
      name: z.string(),
      allergies: z.array(z.string()),
      chronicConditions: z.array(z.string()),
      medications: z.array(z.string())
    }),
    visit_history: z.array(z.any())
  })
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
export type PatientState = z.infer<typeof PatientStateSchema>;
export type VisitMetadata = z.infer<typeof VisitMetadataSchema>;
export type Enrichment = z.infer<typeof EnrichmentSchema>;
export type MCPContext = z.infer<typeof MCPContextSchema>;

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private patientService: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(patientService: any) {
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
          emr: {
            patient_data: {
              name: `Paciente ${input.visit.id.substring(0, 6)}`,
              allergies: [],
              chronicConditions: [],
              medications: []
            },
            visit_history: []
          }
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