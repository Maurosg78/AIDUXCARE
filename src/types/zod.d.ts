declare module 'zod' {
  export namespace z {
    export function string(): any;
    export function number(): any;
    export function boolean(): any;
    export function object(shape: any): any;
    export function array(schema: any): any;
    export function createEnum(values: any[]): any;
    export function optional(schema: any): any;
    export function record(keySchema: any, valueSchema: any): any;
    export function unknown(): any;
    export function parse(schema: any, data: any): any;
    
    export namespace infer {
      export type infer<T> = any;
    }
  }
  
  export const z: typeof z;
} 