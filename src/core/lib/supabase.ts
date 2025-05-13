import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';
import { createSupabaseMock } from '@/core/utils/mock';

// Establecemos las variables de entorno para el cliente de Supabase
// Usar undefined en tipos para compatibilidad con vite-env.d.ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string | undefined;

// Verificar si tenemos las credenciales necesarias
const hasCredentials = !!supabaseUrl && !!supabaseKey;

// Añadir headers de verificación en producción
const headers = {
  'x-client-info': 'AiDuxCare/1.0.0',
};

// Creamos un cliente de Supabase con las opciones adecuadas o un mock
export const supabase = hasCredentials && supabaseUrl && supabaseKey
  ? createClient<Database>(
      supabaseUrl,
      supabaseKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
        global: {
          headers
        }
      }
    ) 
  : createSupabaseMock() as any;

// Función para verificar que la configuración de Supabase está presente
export function verifySupabaseConfig(): boolean {
  return hasCredentials;
}

// Hook para trabajar con Supabase (mantener compatibilidad con código existente)
export function useSupabase() {
  return supabase;
}