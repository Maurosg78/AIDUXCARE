import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  base: './',
  publicDir: 'public',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  define: {
    'process.env.VITE_LANGFUSE_PUBLIC_KEY': JSON.stringify(process.env.VITE_LANGFUSE_PUBLIC_KEY || 'dummy'),
    'process.env.VITE_LANGFUSE_SECRET_KEY': JSON.stringify(process.env.VITE_LANGFUSE_SECRET_KEY || 'dummy'),
    'process.env.VITE_LANGFUSE_BASE_URL': JSON.stringify(process.env.VITE_LANGFUSE_BASE_URL || 'https://cloud.langfuse.com'),
    'process.env.NEXTAUTH_SECRET': JSON.stringify(process.env.NEXTAUTH_SECRET || 'nextauthdummy'),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV !== 'production',
    target: 'es2020',
    assetsDir: 'assets',
    manifest: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: process.env.NODE_ENV === 'production',
      },
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@headlessui/react', '@heroicons/react'],
        },
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    open: true,
    fs: {
      strict: true,
    },
    host: true,
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'next-auth', '@mui/material', '@mui/icons-material']
  },
  css: {
    postcss: './postcss.config.cjs'
  }
});
