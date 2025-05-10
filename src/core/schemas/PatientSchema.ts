import { z } from 'zod';
import { Patient } from '@/core/types';

/**
 * Schema para validar datos de pacientes
 * Define la estructura y restricciones de los datos de un paciente
 */
export const PatientSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, { message: 'El nombre es requerido' }),
  firstName: z.string().min(1, { message: 'El nombre es requerido' }).optional(),
  lastName: z.string().min(1, { message: 'El apellido es requerido' }).optional(),
  dateOfBirth: z.string(),
  gender: z.string().optional(),
  sex: z.enum(['M', 'F', 'O']).optional(),
  email: z.string().email({ message: 'Email inválido' }).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  history: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Tipo para creación - sin id, createdAt o updatedAt
export const PatientCreateSchema = PatientSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Tipo para actualización - todas las propiedades opcionales excepto id
export const PatientUpdateSchema = PatientSchema.partial().required({
  id: true,
});

// Re-exportamos el tipo Patient desde el archivo central de tipos
export type { Patient }; 