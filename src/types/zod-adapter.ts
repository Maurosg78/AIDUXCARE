/**
 * Adaptador para simular métodos de Zod que no existen
 * o tienen una API diferente en nuestra implementación.
 */
import type { z, Schema  } from '@/types/zod-utils';

// Tipos para compatibilidad
type ZodType<T> = Schema<T>;
type ZodTypeAny = ZodType<any>;

// Función para crear un enum
export function createEnum<T extends [string, ...string[]]>(values: T) {
  return z.enumValues(values);
}

// Función para crear un literal
export function createLiteral<T extends string | number | boolean>(value: T) {
  return z.literal(value);
}

// Función para crear una unión discriminada
export function createDiscriminatedUnion<
  K extends string,
  Options extends ZodType<any>[]
>(discriminator: K, options: Options) {
  // Utilizamos la versión con spread operator para compatibilidad
  return z.union(...(options as any));
}

// Función para crear una unión
export function createUnion<T extends ZodType<any>[]>(
  types: T
) {
  // Utilizamos la versión con spread operator para compatibilidad
  return z.union(...(types as any));
}

// Tipo de inferencia
export type Infer<T extends ZodTypeAny> = T['_type'];

export const zodAdapter = {
  createEnum,
  createLiteral,
  createDiscriminatedUnion,
  createUnion,
}; 