import { z } from 'zod';

// Esquemas de validación base
export const PatientStateSchema = z.object({
  age: z.number().min(0).max(120),
  sex: z.enum(['M', 'F', 'O']),
  history: z.array(z.string())
});

export const VisitMetadataSchema = z.object({
  visit_id: z.string().uuid(),
  date: z.string().datetime(),
  professional: z.string().email()
});

export const BaseEnrichmentSchema = z.record(z.string(), z.record(z.string(), z.unknown())).optional();

// Schema base del contexto MCP
export const MCPContextSchema = z.object({
  user_input: z.string(),
  patient_state: PatientStateSchema,
  visit_metadata: VisitMetadataSchema,
  rules_and_constraints: z.array(z.string()),
  system_instructions: z.string(),
  model_response: z.string().optional(),
  observed_outcome: z.string().optional(),
  enrichment: BaseEnrichmentSchema
});

// Schema para datos de enriquecimiento
export const EnrichmentDataSchema = z.object({
  langfuse: z.object({
    trace_id: z.string().optional(),
    enriched_at: z.string().datetime()
  }).optional(),
  global_rules: z.object({
    global_rules: z.array(z.string()),
    applied_at: z.string().datetime()
  }).optional(),
  emr: z.object({
    patient_data: z.record(z.string(), z.unknown()).nullable(),
    visit_history: z.array(z.record(z.string(), z.unknown())),
    enriched_at: z.string().datetime(),
    error: z.string().optional()
  }).optional()
});

// Schema del contexto MCP enriquecido
export const EnrichedMCPContextSchema = MCPContextSchema.extend({
  enrichment: EnrichmentDataSchema
});

// Tipos exportados
export type MCPContext = z.infer<typeof MCPContextSchema>;
export type EnrichedMCPContext = z.infer<typeof EnrichedMCPContextSchema>; 