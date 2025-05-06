import { z } from 'zod';
import { ProfessionalSchema } from './ProfessionalSchema';

/**
 * Schema para validar visitas clínicas
 * Define la estructura y restricciones de los datos de una visita
 */
const VisitStatusSchema = z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']);
const PaymentStatusSchema = z.enum(['pending', 'paid', 'cancelled', 'refunded']);
const ModalidadSchema = z.enum(['presencial', 'telematica']);

export const VisitSchema = z.object({
  id: z.string().uuid(),
  patientId: z.string(),
  professionalId: z.string(),
  professionalEmail: z.string().email(),
  scheduledDate: z.string().datetime(),
  duration: z.number().min(15).max(120).optional(),
  status: VisitStatusSchema,
  paymentStatus: PaymentStatusSchema,
  motivo: z.string(),
  modalidad: ModalidadSchema.optional(),
  precio: z.number().optional(),
  previousHistory: z.boolean().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  notes: z.string().optional(),
  metadata: z.object({
    visit_type: z.string(),
    duration_minutes: z.number(),
    location: z.string().optional(),
    follow_up_required: z.boolean()
  }).optional()
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