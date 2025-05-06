import { z } from 'zod';

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

// Eventos de Formulario
export const formEventSchema = z.object({
  name: z.literal('form.update').or(z.literal('form.submit')),
  payload: z.object({
    patientId: z.string(),
    field: z.string().optional(),
    value: z.string().optional(),
    timestamp: z.string().datetime()
  }),
  traceId: z.string().optional()
});

export type FormEvent = z.infer<typeof formEventSchema>;

// Eventos de Audio
export const audioEventSchema = z.object({
  name: z.enum(['audio.start_listening', 'audio.validate_field', 'audio.approve_data']),
  payload: z.object({
    field: z.string().optional(),
    value: z.string().optional(),
    fields: z.array(z.object({
      field: z.string(),
      value: z.string()
    })).optional(),
    timestamp: z.string().datetime()
  })
});

export type AudioEvent = z.infer<typeof audioEventSchema>;

// Eventos de Copilot
export const copilotEventSchema = z.object({
  name: z.enum(['copilot.suggestion', 'copilot.feedback']),
  payload: z.object({
    patientId: z.string(),
    suggestion: z.string().optional(),
    feedback: z.enum(['positive', 'negative', 'ignored']).optional(),
    field: z.string().optional(),
    timestamp: z.string().datetime()
  }),
  traceId: z.string().optional()
});

export type CopilotEvent = z.infer<typeof copilotEventSchema>;

// Eventos de Administración
export const adminEventSchema = z.object({
  name: z.enum([
    'admin.export.stats',
    'admin.export.activity',
    'admin.export.copilot-impact'
  ]),
  payload: z.object({
    timestamp: z.string().datetime(),
    patientId: z.string().optional(),
    value: z.string().optional(),
    field: z.string().optional(),
    fields: z.array(z.object({
      name: z.string(),
      value: z.string()
    })).optional(),
    format: z.string().optional(),
    dataSize: z.number().optional(),
    approvedCount: z.number().optional()
  })
});

export type AdminEvent = z.infer<typeof adminEventSchema>;

// Eventos de EMR
export const emrEventSchema = z.object({
  name: z.enum([
    'emr.field.update',
    'emr.voice.notes.validated'
  ]),
  payload: z.object({
    timestamp: z.string().datetime(),
    patientId: z.string().optional(),
    value: z.string().optional(),
    field: z.string().optional(),
    fields: z.array(z.object({
      name: z.string(),
      value: z.string()
    })).optional(),
    format: z.string().optional(),
    dataSize: z.number().optional(),
    approvedCount: z.number().optional()
  })
});

export type EmrEvent = z.infer<typeof emrEventSchema>;

// Unión de todos los tipos de eventos
export const LangfuseEventSchema = z.object({
  name: z.enum([
    'form.update',
    'form.submit',
    'audio.start_listening',
    'audio.validate_field',
    'audio.approve_data',
    'copilot.suggestion',
    'copilot.feedback',
    'admin.export.stats',
    'admin.export.activity',
    'admin.export.copilot-impact',
    'emr.field.update',
    'emr.voice.notes.validated'
  ]),
  payload: z.object({
    timestamp: z.string().datetime(),
    patientId: z.string().optional(),
    value: z.string().optional(),
    field: z.string().optional(),
    fields: z.array(z.object({
      name: z.string(),
      value: z.string()
    })).optional(),
    format: z.string().optional(),
    dataSize: z.number().optional(),
    approvedCount: z.number().optional()
  })
});

export type LangfuseEvent = z.infer<typeof LangfuseEventSchema>;

// Validador general de eventos
export const validateEvent = (event: unknown): LangfuseEvent => {
  const result = z.union([
    formEventSchema,
    audioEventSchema,
    copilotEventSchema
  ]).safeParse(event);

  if (!result.success) {
    throw new Error(`Evento inválido: ${result.error.message}`);
  }

  return result.data;
}; 