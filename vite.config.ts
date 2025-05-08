import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const isProd = mode === 'production';
  
  console.log('🔧 Vite Config - Environment Check:', {
    mode,
    hasPublicKey: !!env.VITE_LANGFUSE_PUBLIC_KEY,
    hasSecretKey: !!env.VITE_LANGFUSE_SECRET_KEY,
    hasBaseUrl: !!env.VITE_LANGFUSE_BASE_URL,
    apiBaseUrl: env.VITE_API_BASE_URL
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
      port: 5176,
      strictPort: true
    },
    define: {
      'import.meta.env.VITE_LANGFUSE_PUBLIC_KEY': JSON.stringify(env.VITE_LANGFUSE_PUBLIC_KEY),
      'import.meta.env.VITE_LANGFUSE_SECRET_KEY': JSON.stringify(env.VITE_LANGFUSE_SECRET_KEY),
      'import.meta.env.VITE_LANGFUSE_BASE_URL': JSON.stringify(env.VITE_LANGFUSE_BASE_URL),
    },
  };
});
