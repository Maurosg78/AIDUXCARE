/// <reference types="vite/client" />

// Declaración global para resolver problemas de importación
declare module '@/core/services/AuditLogService';
declare module '@/core/services/audit/AuditLogService';
declare module '@/core/context/AuthContext';
declare module '@/core/contexts/AuthContext';
declare module '@/core/config/routes';
declare module '@/core/lib/langfuse.client';
declare module '@/core/lib/supabaseClient';
declare module '@/hooks/useCopilot';
declare module '@/core/lib/langfuse.config';
declare module '@/core/types/supabase';
declare module '@/core/services/visit/VisitService';
declare module '@/core/services/patient/PatientService';
declare module '@/core/services';

// Declarar otros módulos que puedan estar causando problemas
declare module '@/core/services/*';
declare module '@/core/contexts/*';
declare module '@/core/lib/*';
declare module '@/components/*';
declare module '@/modules/*';

/**
 * Extiende la declaración de variables de entorno
 * para que estén disponibles con autocompletado
 */
interface ImportMetaEnv {
  // Variables de entorno básicas de Vite
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
  
  // Variables requeridas (deben estar siempre presentes)
  readonly VITE_API_BASE_URL: string;
  
  // Claves para servicios externos (opcionales)
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_KEY?: string;
  
  // Claves para integración con Langfuse (opcionales)
  readonly VITE_LANGFUSE_PUBLIC_KEY?: string;
  readonly VITE_LANGFUSE_SECRET_KEY?: string;
  readonly VITE_LANGFUSE_BASE_URL?: string;
  
  // Claves para integración con Hugging Face
  readonly VITE_HUGGINGFACE_API_KEY?: string;
  
  // Otros servicios y configuraciones
  readonly VITE_OPENAI_API_KEY?: string;
  readonly VITE_STORAGE_PREFIX?: string;
  readonly VITE_NEXTAUTH_URL?: string;
  readonly VITE_NEXTAUTH_SECRET?: string;
  
  // Entorno actual
  readonly VITE_ENV?: 'development' | 'production' | 'test';
  readonly VITE_DEBUG?: 'true' | 'false';
  
  // Características
  readonly VITE_ENABLE_ANALYTICS?: 'true' | 'false';
}

/**
 * Hacemos disponible ImportMetaEnv para autocompletado global
 */
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * Declaración para soporte de módulos .svg
 */
declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
} 