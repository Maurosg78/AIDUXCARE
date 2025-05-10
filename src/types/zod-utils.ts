// Utilidades y tipos para trabajar con zod
import * as realZod from 'zod';

// Re-exportar la versión original de zod 
export const z = realZod.z;

// Namespace para simular el comportamiento de zod para validaciones de tipos
export namespace zMock {
  export interface ZodType<T = any> {
    _type: T;
  }
  
  export interface ZodString extends ZodType<string> {}
  export interface ZodNumber extends ZodType<number> {}
  export interface ZodBoolean extends ZodType<boolean> {}
  export interface ZodArray<T> extends ZodType<T[]> {}
  export interface ZodObject<T> extends ZodType<T> {}
  export interface ZodEnum<T extends readonly [string, ...string[]]> extends ZodType<T[number]> {}
  export interface ZodUnion<T> extends ZodType<T> {}
  export interface ZodNullable<T> extends ZodType<T | null> {}
  export interface ZodOptional<T> extends ZodType<T | undefined> {}
  
  // Función para simular la inferencia de tipos
  export type infer<T extends ZodType> = T['_type'];
  
  // Funciones de creación de esquemas básicas
  export function string(): ZodString {
    return { _type: '' as any };
  }
  
  export function number(): ZodNumber {
    return { _type: 0 as any };
  }
  
  export function boolean(): ZodBoolean {
    return { _type: false as any };
  }
  
  export function array<T>(schema: ZodType<T>): ZodArray<T> {
    return { _type: [] as any };
  }
  
  export function object<T>(shape: Record<string, ZodType>): ZodObject<T> {
    return { _type: {} as any };
  }
  
  // Usamos enumValues en lugar de enum que es palabra reservada
  export function enumValues<T extends readonly [string, ...string[]]>(values: T): ZodEnum<T> {
    return { _type: values[0] as any };
  }
  
  export function union<T>(types: ZodType[]): ZodUnion<T> {
    return { _type: undefined as any };
  }
  
  export function nullable<T>(schema: ZodType<T>): ZodNullable<T> {
    return { _type: null as any };
  }
  
  export function optional<T>(schema: ZodType<T>): ZodOptional<T> {
    return { _type: undefined as any };
  }
} 