// Este script se carga desde el HTML y proporciona variables de entorno al frontend
(function(global) {
  // Define __ENV en el objeto global (window en navegadores)
  global.__ENV = {
    // El placeholder %%VITE_SUPABASE_URL%% será reemplazado durante el despliegue
    VITE_SUPABASE_URL: "%%VITE_SUPABASE_URL%%",
    
    // El placeholder %%VITE_SUPABASE_ANON_KEY%% será reemplazado durante el despliegue
    VITE_SUPABASE_ANON_KEY: "%%VITE_SUPABASE_ANON_KEY%%",
    
    // También podemos exportar otras variables de entorno si es necesario
    DEPLOY_ENV: "production",
    DEPLOY_TIMESTAMP: new Date().toISOString()
  };
})(typeof window !== 'undefined' ? window : this); 