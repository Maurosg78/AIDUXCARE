/**
 * Configuración centralizada para AiDuxCare
 * Este archivo proporciona configuración unificada para evitar dependencias en .env.local
 */

interface AppConfig {
  api: {
    baseUrl: string;
    routes: {
      patients: string;
      visits: string;
    };
  };
  supabase: {
    url: string;
    anonKey: string;
  };
}

// Configuración para ambiente de desarrollo
export const appConfig: AppConfig = {
  api: {
    baseUrl: 'http://localhost:3000',
    routes: {
      patients: '/api/patients',
      visits: '/api/visits'
    }
  },
  supabase: {
    url: 'https://mchyxyuaegsbrwodengr.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jaHl4eXVhZWdzYnJ3b2RlbmdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NjU1MzQsImV4cCI6MjA2MjE0MTUzNH0.cXMj4nlE7oExTRetNT2x4ktq6yoCuwy0dVDziq5C-co'
  }
};

// Helper para obtener la configuración completa
export function getConfig(): AppConfig {
  return appConfig;
}

// Helper para obtener URL completa de API
export function getApiUrl(path: string): string {
  return `${appConfig.api.baseUrl}${path}`;
}

export default appConfig; 