import { z } from 'zod';

/**
 * Schema para validar datos de pacientes
 * Define la estructura y restricciones de los datos de un paciente
 */
export const PatientSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().min(2).max(100),
  birth_date: z.string().datetime(),
  sex: z.enum(['M', 'F', 'O']),
  email: z.string().email().optional(),
  clinical_history: z.array(z.string()).or(z.string()),
  tags: z.array(z.string()),
  status: z.enum(['active', 'archived']),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export type Patient = z.infer<typeof PatientSchema>; 