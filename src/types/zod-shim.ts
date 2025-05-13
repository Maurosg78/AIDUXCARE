/**
 * Este archivo proporciona un "shim" o adaptador que permite
 * usar parte de la API de zod pero mapeando a nuestra propia
 * implementación de validación.
 */
import * as z from '@/types/zod-utils';

// Re-exportamos el objeto z para un uso más sencillo
export const zod = z;

// Tipo para representar cualquier esquema de validación
export type ZodType<T> = z.Schema<T>;
export type ZodRawShape = Record<string, ZodType<any>>;
export type ZodTypeAny = ZodType<any>;

// Función para crear un esquema de enumeración
export function createEnum<T extends readonly [string, ...string[]]>(values: T) {
  return z.enumValues(values);
}

// Función para crear un esquema de objeto
export function createObject<T extends Record<string, any>>(shape: Record<string, ZodType<any>>) {
  return z.object(shape);
}

// Función para crear un esquema de array
export function createArray<T>(schema: ZodType<T>) {
  return z.array(schema);
}

// Funciones básicas
export function createString() {
  return z.string();
}

export function createNumber() {
  return z.number();
}

export function createBoolean() {
  return z.boolean();
}

export function createOptional<T>(schema: ZodType<T>) {
  return schema.optional();
}

// Tipo para inferencia
export type Infer<T extends ZodType<any>> = T['_type'];

// Función para validar datos
export function parse<T>(schema: ZodType<T>, data: unknown): T {
  return schema.parse(data);
}

// Exportaciones para compatibilidad
export default {
  enum: createEnum,
  object: createObject,
  array: createArray,
  string: createString,
  number: createNumber,
  boolean: createBoolean,
  optional: createOptional,
  parse
}; 