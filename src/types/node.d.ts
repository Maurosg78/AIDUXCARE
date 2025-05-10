// Declaración para tipos de Node que faltan
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    VITE_SUPABASE_URL: string;
    VITE_SUPABASE_KEY: string;
    VITE_LANGFUSE_PUBLIC_KEY: string;
    VITE_LANGFUSE_SECRET_KEY: string;
    LANGFUSE_SECRET_KEY: string;
    VITE_LANGFUSE_BASE_URL: string;
    VITE_LANGFUSE_HOST: string;
    PORT?: string;
    [key: string]: string | undefined;
  }
}

// Declarar módulos del sistema de Node.js
declare module 'path' {
  export function join(...paths: string[]): string;
  export function resolve(...paths: string[]): string;
  export function dirname(path: string): string;
  export function basename(path: string, ext?: string): string;
  export function extname(path: string): string;
  export default {
    join,
    resolve,
    dirname,
    basename,
    extname
  };
} 