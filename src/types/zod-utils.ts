/**
 * Utilidades para validación de esquemas usando Zod
 * 
 * Este archivo proporciona exportaciones y helpers para validar datos
 * contra esquemas usando la biblioteca Zod.
 */

import * as zod from 'zod';
export { zod as z };

// Tipo para inferir tipos desde un schema de Zod
export type infer<T extends zod.ZodType> = zod.infer<T>;

/**
 * Helper para crear un validador de tipo Zod para DTOs
 * @param schema Esquema Zod a usar para validación
 * @returns Una función que valida un objeto contra el esquema
 */
export function createValidator<T extends zod.ZodType>(schema: T) {
  return (data: unknown): infer<T> => {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof zod.ZodError) {
        const formattedError = new Error('Validation error');
        (formattedError as any).details = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code
        }));
        throw formattedError;
      }
      throw error;
    }
  };
}

/**
 * Helper para validar un objeto parcial (fragmento)
 * @param schema Esquema Zod a usar para validación
 * @returns Una función que valida un objeto parcial contra el esquema
 */
export function createPartialValidator<T extends zod.ZodObject<any>>(schema: T) {
  return (data: unknown): Partial<infer<T>> => {
    const partialSchema = schema.partial();
    return createValidator(partialSchema)(data);
  };
}

/**
 * Helper para validar un objeto contra un esquema y obtener los errores en formato amigable
 * @param schema Esquema Zod a usar para validación
 * @param data Datos a validar
 * @returns Un objeto con el resultado de la validación y posibles errores
 */
export function validateWithErrors<T extends zod.ZodType>(
  schema: T,
  data: unknown
): { success: boolean; data?: infer<T>; errors?: Array<{ path: string; message: string }> } {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof zod.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      };
    }
    return {
      success: false,
      errors: [{ path: '', message: error instanceof Error ? error.message : 'Unknown error' }]
    };
  }
} 