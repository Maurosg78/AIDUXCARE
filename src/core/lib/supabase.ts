import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/core/types';

// Establecemos las variables de entorno para el cliente de Supabase
// Declaración de tipo para entorno Vite
declare global {
  interface ImportMetaEnv {
    VITE_SUPABASE_URL: string;
    VITE_SUPABASE_KEY: string;
    PROD: boolean;
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

// Añadir headers de verificación en producción
let headers = {};
if (import.meta.env.PROD) {
  headers = {
    'X-Application-Info': 'AiDuxCare/1.0.0',
    'X-Client-Info': 'supabase-js/2.10.0'
  };
}

// Creamos un cliente de Supabase con las opciones adecuadas
const supabase = createClient<Database>(
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
);

// Exportamos supabase como default y también como export nombrado
// para mantener compatibilidad con diferentes estilos de importación
export { supabase };
export default supabase;