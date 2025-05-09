/// <reference types="vite/client" />

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Extender el tipo Window para incluir __ENV
declare global {
  interface Window {
    __ENV?: {
      VITE_SUPABASE_URL?: string;
      VITE_SUPABASE_ANON_KEY?: string;
      [key: string]: string | undefined;
    };
  }
}

const isBrowser = typeof window !== 'undefined';

// Debugging para entornos de producción
console.log('🔍 [Supabase] Inicializando cliente, Browser=', isBrowser);
console.log('🔍 [Supabase] Modo:', import.meta.env.MODE);

// Variables para almacenar los valores de configuración
let SUPABASE_URL = '';
let SUPABASE_ANON_KEY = '';

// Definir una función para extraer las variables directamente de la ventana global
// cuando estamos en un ambiente de navegador en producción
const getEnvVarsFromWindow = () => {
  if (isBrowser && window.__ENV) {
    console.log('🔍 [Supabase] Obteniendo variables de window.__ENV');
    return {
      url: window.__ENV?.VITE_SUPABASE_URL,
      key: window.__ENV?.VITE_SUPABASE_ANON_KEY,
    };
  }
  return { url: null, key: null };
};

try {
  // 1. Primero intentamos leer desde import.meta.env (funcionará en desarrollo y puede funcionar en producción)
  SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
  SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  // 2. Si no se encontraron las variables y estamos en el navegador, verificamos window.__ENV
  if ((!SUPABASE_URL || !SUPABASE_ANON_KEY) && isBrowser) {
    const windowVars = getEnvVarsFromWindow();
    if (windowVars.url && windowVars.key) {
      SUPABASE_URL = windowVars.url;
      SUPABASE_ANON_KEY = windowVars.key;
      console.log('✅ [Supabase] Variables encontradas en window.__ENV');
    }
  }
  
  // 3. Si aún no tenemos las variables, usamos valores directos
  // Solo como último recurso en producción
  if ((!SUPABASE_URL || !SUPABASE_ANON_KEY) && import.meta.env.PROD) {
    console.warn('⚠️ [Supabase] Usando valores alternativos directos');
    
    // Usar los valores actuales directamente - esta es una solución temporal
    // pero garantizada para funcionar en producción
    SUPABASE_URL = 'https://mchyxyuaegsbrwodengr.supabase.co';
    
    // IMPORTANTE: Usando una clave anon generada específicamente para ambiente de producción
    // Asegúrate de que esta sea una clave válida de tu proyecto con los permisos correctos
    SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jaHl4eXVhZWdzYnJ3b2RlbmdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NjU1MzQsImV4cCI6MjA2MjE0MTUzNH0.cXMj4nlE7oExTRetNT2x4ktq6yoCuwy0dVDziq5C-co';
  }
} catch (error) {
  console.error('❌ [Supabase] Error al acceder a variables de entorno:', error);
  
  // Fallback para producción con valores directos como último recurso
  if (import.meta.env.PROD) {
    console.warn('⚠️ [Supabase] Usando valores de emergencia desde el catch');
    SUPABASE_URL = 'https://mchyxyuaegsbrwodengr.supabase.co';
    SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jaHl4eXVhZWdzYnJ3b2RlbmdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NjU1MzQsImV4cCI6MjA2MjE0MTUzNH0.cXMj4nlE7oExTRetNT2x4ktq6yoCuwy0dVDziq5C-co';
  }
}

// Validar y mostrar información de diagnóstico
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ [Supabase] Error crítico: Variables de entorno no disponibles');
  console.error(`Browser=${isBrowser}, URL=${SUPABASE_URL ? 'definida' : 'undefined'}, KEY=${SUPABASE_ANON_KEY ? 'definida (longitud: ' + SUPABASE_ANON_KEY.length + ')' : 'undefined'}`);
  
  throw new Error(`❌ supabaseClient: missing env vars. Browser=${isBrowser} URL=${SUPABASE_URL ? 'defined' : 'undefined'} KEY=${SUPABASE_ANON_KEY ? 'defined' : 'undefined'}`);
}

console.log('✅ [Supabase] Variables configuradas correctamente:');
console.log('- URL:', SUPABASE_URL.substring(0, 20) + '...');
console.log('- Key Length:', SUPABASE_ANON_KEY.length);
console.log('- Key primeros 20 caracteres:', SUPABASE_ANON_KEY.substring(0, 20) + '...');

// Crear cliente de Supabase con opciones avanzadas para mayor compatibilidad
const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    fetch: (url: string, options: RequestInit) => {
      // Asegurar que estamos enviando las credenciales correctas
      const newOptions: RequestInit = {
        ...options,
        headers: {
          ...(options.headers || {}),
          'X-Client-Info': 'supabase-js/2.x',
          'Content-Type': 'application/json',
        }
      };
      return fetch(url, newOptions);
    }
  }
});

// Verificar la conexión a Supabase
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ [Supabase] Error de autenticación:', error.message);
  } else {
    console.log('✅ [Supabase] Sesión verificada:', data.session ? 'Activa' : 'Inactiva');
  }
}).catch(err => {
  console.error('❌ [Supabase] Error al verificar sesión:', err.message);
});

console.log('✅ [Supabase] Cliente inicializado correctamente');

export const authClient = supabase.auth;
export default supabase;
