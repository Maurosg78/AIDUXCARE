import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  plugins: [react()],
  base: '/',
  publicDir: 'public',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'process.env': process.env,
    'process.env.VITE_LANGFUSE_PUBLIC_KEY': JSON.stringify(process.env.VITE_LANGFUSE_PUBLIC_KEY),
    'process.env.VITE_LANGFUSE_SECRET_KEY': JSON.stringify(process.env.VITE_LANGFUSE_SECRET_KEY),
    'process.env.VITE_LANGFUSE_BASE_URL': JSON.stringify(process.env.VITE_LANGFUSE_BASE_URL),
    'process.env.NEXTAUTH_SECRET': JSON.stringify(process.env.NEXTAUTH_SECRET),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'next-auth'],
          ui: ['@mui/material', '@mui/icons-material'],
        },
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  server: {
    port: 5174,
    strictPort: true,
    open: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'next-auth']
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  }
});
