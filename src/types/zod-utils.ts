/**
 * Utilidades minimalistas para esquemas de validación
 * Versión simul-compatible sin dependencias de Zod
 */

// Tipos básicos para esquemas
export interface Schema<T> {
  _type: T;
  optional(): Schema<T | undefined>;
  nullable(): Schema<T | null>;
  parse(data: unknown): T;
  uuid(): Schema<string>;
  email(): Schema<string>;
  datetime(): Schema<string>;
}

// Espacio de nombres para tipos compatibles con zod
export namespace ZodSchema {
  export interface ZodType<T> {
    _type: T;
  }
  
  export interface ZodString extends ZodType<string> {}
  export interface ZodNumber extends ZodType<number> {}
  export interface ZodBoolean extends ZodType<boolean> {}
  export interface ZodArray<T> extends ZodType<T[]> {}
  export interface ZodObject<T> extends ZodType<T> {}
  export interface ZodEnum<T> extends ZodType<T> {}
  export interface ZodOptional<T> extends ZodType<T | undefined> {}
  export interface ZodNullable<T> extends ZodType<T | null> {}
  
  export type infer<T> = T extends ZodType<infer R> ? R : never;
}

// Simulación de error de Zod
export class ZodError {
  errors: Array<{path: string[], message: string}>;
  
  constructor(errors: Array<{path: string[], message: string}>) {
    this.errors = errors;
  }
}

// Funciones de creación de esquemas
function createSchema<T>(): Schema<T> {
  return {
    _type: {} as T,
    optional: function() { return createSchema<T | undefined>(); },
    nullable: function() { return createSchema<T | null>(); },
    parse: function(data: unknown) { return data as T; },
    uuid: function() { return this as Schema<string>; },
    email: function() { return this as Schema<string>; },
    datetime: function() { return this as Schema<string>; }
  };
}

// Crea un esquema para strings
export function string(): Schema<string> {
  const schema = createSchema<string>();
  
  // Métodos de validación específicos para string
  const extendedSchema = {
    ...schema,
    uuid: () => {
      return schema;
    },
    email: () => {
      return schema;
    },
    datetime: () => {
      return schema;
    }
  };
  
  return extendedSchema;
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

export function record<K extends string, V>(keyType: Schema<K>, valueType: Schema<V>): Schema<Record<K, V>> {
  return createSchema<Record<K, V>>();
}

export function enumValues<T extends readonly [string, ...string[]]>(values: T): Schema<T[number]> {
  return createSchema<T[number]>();
}

export function literal<T extends string | number | boolean>(value: T): Schema<T> {
  return createSchema<T>();
}

export function optional<T>(schema: Schema<T>): Schema<T | undefined> {
  return schema.optional();
}

export function union<T extends Array<Schema<any>>>(...schemas: T): Schema<T[number]['_type']> {
  return createSchema<T[number]['_type']>();
}

export function discriminatedUnion<
  K extends string,
  T extends Array<Schema<{ [P in K]: string }>>
>(key: K, schemas: T): Schema<T[number]['_type']> {
  return createSchema<T[number]['_type']>();
}

export function any(): Schema<any> {
  return createSchema<any>();
}

// Función para inferir el tipo
export function infer<T>(schema: Schema<T>): T {
  return {} as T;
}

// Tipo para inferir el tipo de un esquema
export type Infer<T extends Schema<any>> = T['_type'];

// Re-exportamos todo como 'z'
export const z = {
  string,
  number,
  boolean,
  array,
  object,
  record,
  literal,
  optional,
  union,
  enumValues: enumValues,  // Usamos enumValues en lugar de enum (palabra reservada)
  discriminatedUnion,
  any,
  ZodError,
  infer
}; 