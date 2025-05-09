/// <reference types="vite/client" />

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Para debugging en la consola del navegador
console.log('🔍 [Supabase] Inicializando cliente...');

// Valores fijos
// Estos valores funcionarán tanto en desarrollo como en producción
// Esta es una solución directa para el problema de las variables de entorno en Vercel
const SUPABASE_URL = 'https://mchyxyuaegsbrwodengr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jaHl4eXVhZWdzYnJ3b2RlbmdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NjU1MzQsImV4cCI6MjA2MjE0MTUzNH0.cXMj4nlE7oExTRetNT2x4ktq6yoCuwy0dVDziq5C-co';

console.log('✅ [Supabase] Utilizando URL:', SUPABASE_URL);
console.log('✅ [Supabase] Key configurada correctamente (longitud:', SUPABASE_ANON_KEY.length, ')');

// Crear el cliente con configuración robusta
const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
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
