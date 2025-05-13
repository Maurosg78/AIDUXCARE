import type { z  } from '../../types/schema-utils';
import type { Patient  } from '@/core/types';

/**
 * Schema para validar datos de pacientes
 * Define la estructura y restricciones de los datos de un paciente
 */
export const PatientSchema = z.object({
  id: z.optional(z.string()),
  name: z.string(),
  firstName: z.optional(z.string()),
  lastName: z.optional(z.string()),
  dateOfBirth: z.string(),
  gender: z.optional(z.string()),
  sex: z.optional(z.enumValues(['M', 'F', 'O'] as const)),
  email: z.optional(z.string()),
  phone: z.optional(z.string()),
  address: z.optional(z.string()),
  history: z.optional(z.array(z.string())),
  createdAt: z.optional(z.string()),
  updatedAt: z.optional(z.string()),
});

// Tipo personalizado para el esquema
export type PatientSchemaType = {
  id?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth: string;
  gender?: string;
  sex?: 'M' | 'F' | 'O';
  email?: string;
  phone?: string;
  address?: string;
  history?: string[];
  createdAt?: string;
  updatedAt?: string;
};

// Tipos adicionales para casos de uso específicos
export type PatientCreateType = Omit<PatientSchemaType, 'id' | 'createdAt' | 'updatedAt'>;

export type PatientUpdateType = Partial<PatientSchemaType> & { id: string };

// Re-exportamos el tipo Patient desde el archivo central de tipos
export type { Patient }; 