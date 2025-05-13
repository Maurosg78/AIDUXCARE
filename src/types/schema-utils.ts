/**
 * Utilidades para manejo de esquemas de datos
 * Compatible con TypeScript strict
 */

// Tipos básicos para esquemas
export interface Schema<T> {
  _type: T;
  optional(): Schema<T | undefined>;
  nullable(): Schema<T | null>;
}

// Funciones de creación de esquemas
export function string(): Schema<string> {
  return createSchema<string>();
}

export function number(): Schema<number> {
  return createSchema<number>();
}

export function boolean(): Schema<boolean> {
  return createSchema<boolean>();
}

export function array<T>(schema: Schema<T>): Schema<T[]> {
  return createSchema<T[]>();
}

export function object<T extends Record<string, any>>(shape: { [K in keyof T]: Schema<T[K]> }): Schema<T> {
  return createSchema<T>();
}

export function record<K extends string, V>(keySchema: Schema<K>, valueSchema: Schema<V>): Schema<Record<K, V>> {
  return createSchema<Record<K, V>>();
}

export function literal<T extends string | number | boolean>(value: T): Schema<T> {
  return createSchema<T>();
}

export function optional<T>(schema: Schema<T>): Schema<T | undefined> {
  return schema.optional();
}

export function nullable<T>(schema: Schema<T>): Schema<T | null> {
  return schema.nullable();
}

export function enumValues<T extends readonly [string, ...string[]]>(values: T): Schema<T[number]> {
  return createSchema<T[number]>();
}

export function union<T extends any[]>(schemas: { [K in keyof T]: Schema<T[K]> }): Schema<T[number]> {
  return createSchema<T[number]>();
}

export function discriminatedUnion<D extends string, T extends any[]>(
  discriminator: D,
  schemas: { [K in keyof T]: Schema<T[K] & { [key in D]: string }> }
): Schema<T[number]> {
  return createSchema<T[number]>();
}

// Funciones auxiliares
function createSchema<T>(): Schema<T> {
  return {
    _type: null as any,
    optional: function() {
      return createSchema<T | undefined>();
    },
    nullable: function() {
      return createSchema<T | null>();
    }
  };
}

// Tipo de inferencia
export type infer<T extends Schema<any>> = T['_type'];

// Exportamos un objeto con todos los métodos
export const z = {
  string,
  number,
  boolean,
  array,
  object,
  record,
  literal,
  optional,
  nullable,
  enumValues,
  enum: enumValues,
  union,
  discriminatedUnion,
  infer: null as any // Solo para compatibilidad de tipo
};

export default z;