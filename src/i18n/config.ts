import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importar traducciones (asegurando compatibilidad con TypeScript)
const es = {
  common: {
    welcome: 'Bienvenido a AiDuxCare',
    login: 'Iniciar sesión',
    logout: 'Cerrar sesión',
    loading: 'Cargando...',
    error: 'Error'
  },
  roles: {
    admin: 'Administrador',
    professional: 'Profesional',
    secretary: 'Secretaria',
    developer: 'Desarrollador',
    fisioterapeuta: 'Fisioterapeuta'
  },
  dashboard: {
    title: 'Panel de {{role}}',
    dev: 'Panel de Desarrollador',
    patients: 'Pacientes',
    visits: 'Visitas',
    stats: 'Estadísticas'
  }
};

// Inicializar i18n con configuración mínima
i18n
  .use(initReactI18next as any)
  .init({
    resources: {
      es: {
        translation: es
      }
    },
    lng: 'es',
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 