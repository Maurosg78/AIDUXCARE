/// <reference types="vite/client" />

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const isBrowser = typeof window !== 'undefined';

// Debugging para entornos de producción
console.log('🔍 [Supabase] Inicializando cliente, Browser=', isBrowser);

// Log más detallado del entorno y las variables
console.log('🔍 [Supabase] Estado de variables de entorno:', {
  MODE: import.meta.env.MODE,
  PROD: import.meta.env.PROD,
  DEV: import.meta.env.DEV,
  BASE_URL: import.meta.env.BASE_URL,
  ENV_LOADED: typeof import.meta.env !== 'undefined',
  HAS_SUPABASE_URL: typeof import.meta.env.VITE_SUPABASE_URL === 'string' && import.meta.env.VITE_SUPABASE_URL.length > 0,
  HAS_SUPABASE_KEY: typeof import.meta.env.VITE_SUPABASE_ANON_KEY === 'string' && import.meta.env.VITE_SUPABASE_ANON_KEY.length > 0,
});

// Intentar recuperar las variables con valores fallback para mayor seguridad
let SUPABASE_URL = '';
let SUPABASE_ANON_KEY = '';

try {
  // Acceso seguro a variables de entorno
  SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
  SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  // Valores hardcodeados de fallback solo para cuando las variables no estén disponibles en producción
  if ((!SUPABASE_URL || !SUPABASE_ANON_KEY) && import.meta.env.PROD) {
    console.warn('⚠️ [Supabase] Usando valores de fallback porque las variables de entorno no están disponibles');
    SUPABASE_URL = SUPABASE_URL || 'https://mchyxyuaegsbrwodengr.supabase.co';
    SUPABASE_ANON_KEY = SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jaHl4eXVhZWdzYnJ3b2RlbmdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NjU1MzQsImV4cCI6MjA2MjE0MTUzNH0.cXMj4nlE7oExTRetNT2x4ktq6yoCuwy0dVDziq5C-co';
  }
} catch (error) {
  console.error('❌ [Supabase] Error al acceder a variables de entorno:', error);
  
  // Fallback para producción
  if (import.meta.env.PROD) {
    SUPABASE_URL = 'https://mchyxyuaegsbrwodengr.supabase.co';
    SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jaHl4eXVhZWdzYnJ3b2RlbmdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NjU1MzQsImV4cCI6MjA2MjE0MTUzNH0.cXMj4nlE7oExTRetNT2x4ktq6yoCuwy0dVDziq5C-co';
  }
}

// Validar si las variables están definidas después de fallbacks
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ [Supabase] Error crítico: Variables de entorno no disponibles');
  console.error(`Browser=${isBrowser}, URL=${SUPABASE_URL ? 'definida' : 'undefined'}, KEY=${SUPABASE_ANON_KEY ? 'definida (longitud: ' + SUPABASE_ANON_KEY.length + ')' : 'undefined'}`);
  
  throw new Error(`❌ supabaseClient: missing env vars. Browser=${isBrowser} URL=${SUPABASE_URL ? 'defined' : 'undefined'} KEY=${SUPABASE_ANON_KEY ? 'defined' : 'undefined'}`);
}

console.log('✅ [Supabase] Variables disponibles:');
console.log('- URL:', SUPABASE_URL.substring(0, 20) + '...');
console.log('- Key Length:', SUPABASE_ANON_KEY.length);

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
    console.log('✅ [Supabase] Monkey-patch aplicado a _getClientInfo');
  } catch (error) {
    console.error('[Supabase] Error al aplicar monkey-patch:', error);
  }
} else {
  console.warn('⚠️ [Supabase] No se encontró el método _getClientInfo');
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
          console.warn('[Supabase] Error al sanear X-Client-Info header:', error);
        }
      }
      return originalFetch.apply(this, args);
    };
    console.log('🔒 [Supabase] Interceptor de fetch instalado');
  } catch (error) {
    console.error('[Supabase] No se pudo instalar interceptor de fetch:', error);
  }
}

console.log('✅ [Supabase] Cliente inicializado correctamente');

export const authClient = supabase.auth;
export default supabase;
