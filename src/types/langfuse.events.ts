import { z } from './zod-utils';

// Tipos base
export type EventMetadata = {
  timestamp: string;
  sessionId?: string;
  userId?: string;
  environment: string;
};

// Esquemas Zod para validación
export const baseEventSchema = z.object({
  timestamp: z.string().datetime(),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
  environment: z.string()
});

// Eventos de formulario
const formEventSchema = z.object<{
  formId: string;
  action: 'submit' | 'validate' | 'error';
  fieldCount: number;
  completionTime?: number;
  errorCount?: number;
  timestamp: string;
}>({
  formId: z.string(),
  action: z.enumValues(['submit', 'validate', 'error'] as const),
  fieldCount: z.number(),
  completionTime: z.optional(z.number()),
  errorCount: z.optional(z.number()),
  timestamp: z.string()
});

export type FormEvent = z.infer<typeof formEventSchema>;

// Eventos de audio
const audioEventSchema = z.object<{
  action: 'start_listening' | 'validate_field' | 'approve_data';
  field?: string;
  value?: string;
  validated?: boolean;
  timestamp: string;
}>({
  action: z.enumValues(['start_listening', 'validate_field', 'approve_data'] as const),
  field: z.optional(z.string()),
  value: z.optional(z.string()),
  validated: z.optional(z.boolean()),
  timestamp: z.string()
});

export type AudioEvent = z.infer<typeof audioEventSchema>;

// Eventos de copiloto
const copilotEventSchema = z.object<{
  action: 'generate' | 'feedback' | 'select' | 'reject';
  source?: string;
  field?: string;
  value?: string;
  modelId?: string;
  timestamp: string;
}>({
  action: z.enumValues(['generate', 'feedback', 'select', 'reject'] as const),
  source: z.optional(z.string()),
  field: z.optional(z.string()),
  value: z.optional(z.string()),
  modelId: z.optional(z.string()),
  timestamp: z.string()
});

export type CopilotEvent = z.infer<typeof copilotEventSchema>;

// Eventos de administrador
const adminEventSchema = z.object<{
  action: 'view_report' | 'export_data' | 'settings_change' | 'user_management';
  userId: string;
  details?: Record<string, unknown>;
  resourceId?: string;
  resourceType?: string;
  result?: 'success' | 'error' | 'warning';
  timestamp: string;
}>({
  action: z.enumValues(['view_report', 'export_data', 'settings_change', 'user_management'] as const),
  userId: z.string(),
  details: z.optional(z.object({})),
  resourceId: z.optional(z.string()),
  resourceType: z.optional(z.string()),
  result: z.optional(z.enumValues(['success', 'error', 'warning'] as const)),
  timestamp: z.string()
});

export type AdminEvent = z.infer<typeof adminEventSchema>;

// Eventos EMR
const emrEventSchema = z.object<{
  action: 'create' | 'update' | 'delete' | 'view' | 'search';
  resourceType: 'patient' | 'visit' | 'evaluation' | 'note';
  resourceId: string;
  userId: string;
  details?: Record<string, unknown>;
  metadata?: {
    changeCount?: number;
    responseTime?: number;
    source?: string;
  };
  result?: 'success' | 'error' | 'warning';
  timestamp: string;
}>({
  action: z.enumValues(['create', 'update', 'delete', 'view', 'search'] as const),
  resourceType: z.enumValues(['patient', 'visit', 'evaluation', 'note'] as const),
  resourceId: z.string(),
  userId: z.string(),
  details: z.optional(z.object({})),
  metadata: z.optional(z.object({
    changeCount: z.optional(z.number()),
    responseTime: z.optional(z.number()),
    source: z.optional(z.string())
  })),
  result: z.optional(z.enumValues(['success', 'error', 'warning'] as const)),
  timestamp: z.string()
});

export type EmrEvent = z.infer<typeof emrEventSchema>;

// Unión de todos los eventos
const LangfuseEventSchema = z.union<FormEvent | AudioEvent | CopilotEvent | AdminEvent | EmrEvent>([
  formEventSchema,
  audioEventSchema,
  copilotEventSchema,
  adminEventSchema,
  emrEventSchema
]);

export type LangfuseEvent = z.infer<typeof LangfuseEventSchema>;

// Validador general de eventos
export const validateEvent = (event: unknown): LangfuseEvent => {
  const result = LangfuseEventSchema.safeParse(event);

  if (!result.success) {
    throw new Error(`Evento inválido: ${JSON.stringify(result.error)}`);
  }

  return result.data;
}; 