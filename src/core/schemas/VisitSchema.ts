import { z } from 'zod';

/**
 * Schema para validar visitas clínicas
 * Define la estructura y restricciones de los datos de una visita
 */
export const VisitSchema = z.object({
  id: z.string().uuid(),
  patient_id: z.string().uuid(),
  date: z.string().datetime(),
  professional: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string().min(1)
  }),
  reason: z.string().min(1).max(500),
  notes: z.string().min(1).max(2000),
  status: z.enum(['completed', 'pending', 'cancelled']),
  metadata: z.object({
    location: z.string().optional(),
    visit_type: z.string(),
    duration_minutes: z.number().int().positive(),
    follow_up_required: z.boolean()
  })
});

export type Visit = z.infer<typeof VisitSchema>;

/**
 * Schema para validar el resumen de una visita
 * Versión simplificada para listados y previews
 */
export const VisitSummarySchema = VisitSchema.pick({
  id: true,
  date: true,
  professional: true,
  reason: true,
  status: true
});

export type VisitSummary = z.infer<typeof VisitSummarySchema>; 