import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  
  // Forzar uso de puerto 5176 sin importar lo que esté en env
  const PORT = 5176;
  
  console.log('🔧 Vite Config - Environment Check:', {
    mode,
    hasPublicKey: !!env.VITE_LANGFUSE_PUBLIC_KEY,
    hasSecretKey: !!env.VITE_LANGFUSE_SECRET_KEY,
    hasBaseUrl: !!env.VITE_LANGFUSE_BASE_URL,
    hasSupabaseUrl: !!env.VITE_SUPABASE_URL,
    hasSupabaseKey: !!env.VITE_SUPABASE_ANON_KEY,
    apiBaseUrl: env.VITE_API_BASE_URL,
    port: PORT
  });

  return {
    plugins: [react()],
    base: "/",
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: PORT,
      strictPort: true,
      force: true
    },
    define: {
      'import.meta.env.VITE_LANGFUSE_PUBLIC_KEY': JSON.stringify(env.VITE_LANGFUSE_PUBLIC_KEY),
      'import.meta.env.VITE_LANGFUSE_SECRET_KEY': JSON.stringify(env.VITE_LANGFUSE_SECRET_KEY),
      'import.meta.env.VITE_LANGFUSE_BASE_URL': JSON.stringify(env.VITE_LANGFUSE_BASE_URL),
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
    },
  };
});
