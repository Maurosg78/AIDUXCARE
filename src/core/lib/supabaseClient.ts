/// <reference types="vite/client" />

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const isBrowser = typeof window !== 'undefined';

const SUPABASE_URL = isBrowser
  ? import.meta.env.VITE_SUPABASE_URL
  : process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = isBrowser
  ? import.meta.env.VITE_SUPABASE_ANON_KEY
  : process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(`❌ supabaseClient: missing env vars. Browser=${isBrowser} URL=${SUPABASE_URL} KEY=${SUPABASE_ANON_KEY}`);
}

console.log('▶️ Supabase URL:', SUPABASE_URL);
console.log('▶️ Supabase anon key length:', SUPABASE_ANON_KEY.length);

// Creamos el cliente de Supabase con headers seguros predefinidos
const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: {
    headers: {
      'X-Client-Info': 'supabase-js/2.x',
    }
  }
});

// Monkey-patch avanzado para sanear headers solo para el método _getClientInfo
// que es la fuente de los errores ISO-8859-1
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabaseAny = supabase as any;
if (typeof supabaseAny._getClientInfo === 'function') {
  try {
    // Reemplazar el método problemático con una versión segura
    const originalGetClientInfo = supabaseAny._getClientInfo;
    supabaseAny._getClientInfo = function() {
      try {
        // Intentamos llamar al método original pero capturamos cualquier
        // valor problemático y lo reemplazamos
        const result = originalGetClientInfo.apply(this);
        return typeof result === 'string' ? 'supabase-js/2.x' : 'supabase-js/2.x';
      } catch {
        // En caso de error, devolvemos un valor seguro
        return 'supabase-js/2.x';
      }
    };
    console.log('✅ Monkey-patch aplicado a Supabase._getClientInfo');
  } catch (error) {
    console.error('Error al aplicar monkey-patch:', error);
  }
} else {
  console.warn('⚠️ No se encontró el método _getClientInfo en Supabase');
}

// Interceptor de fetch si estamos en el navegador para sanear headers
if (isBrowser && window.fetch) {
  try {
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      if (args[1] && args[1].headers) {
        try {
          // Sobrescribir el X-Client-Info header que sabemos que causa problemas
          const headers = args[1].headers;
          if (headers instanceof Headers) {
            if (headers.has('X-Client-Info')) {
              headers.set('X-Client-Info', 'supabase-js/2.x');
            }
          } else if (typeof headers === 'object') {
            // Para headers como objeto plano
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (headers as any)['X-Client-Info'] = 'supabase-js/2.x';
          }
        } catch (error) {
          console.warn('Error al sanear X-Client-Info header:', error);
        }
      }
      return originalFetch.apply(this, args);
    };
    console.log('🔒 Interceptor de fetch instalado para sanear headers problemáticos');
  } catch (error) {
    console.error('No se pudo instalar interceptor de fetch:', error);
  }
}

export const authClient = supabase.auth;
export default supabase;
