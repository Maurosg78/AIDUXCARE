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
  });

  return {
    plugins: [react()],
    base: "/",
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      'import.meta.env.VITE_LANGFUSE_PUBLIC_KEY': JSON.stringify(env.VITE_LANGFUSE_PUBLIC_KEY),
      'import.meta.env.VITE_LANGFUSE_BASE_URL': JSON.stringify(env.VITE_LANGFUSE_BASE_URL),
    },
    build: {
      outDir: "dist",
      sourcemap: !isProd,
      minify: isProd,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['@mui/material', '@mui/icons-material'],
            dateFns: ['date-fns'],
            langfuse: ['langfuse']
          }
        }
      }
    },
    optimizeDeps: {
      include: ['date-fns', '@mui/x-date-pickers', 'langfuse'],
    },
    server: isProd ? undefined : {
      port: 5175,
      strictPort: true,
      open: true,
      watch: {
        usePolling: true
      },
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      }
    }
  };
});
