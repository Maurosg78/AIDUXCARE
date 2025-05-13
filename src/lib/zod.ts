import * as zod from 'zod';
import type { ZodSchema  } from '@/types/zod-utils';

// Simplemente reexportamos zod para su uso en el resto de la aplicación
export const z = zod;

// Tipo personalizado para inferir el tipo de un esquema
export type Infer<T> = T extends { _type: infer R } ? R : never;

// Re-exportamos todo para consistencia en importaciones
export default zod; 