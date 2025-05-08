#!/usr/bin/env node

import { existsSync, writeFileSync, readFileSync } from 'fs';
import { resolve } from 'path';

const ENV_FILE = resolve(process.cwd(), '.env.local');
const MOCK_API_URL = 'http://localhost:3000';

// Valores predeterminados para desarrollo
const defaultEnvVars = {
  // API
  VITE_API_BASE_URL: MOCK_API_URL,
  
  // Langfuse (desarrollo)
  VITE_LANGFUSE_PUBLIC_KEY: 'pk_dev_123456789',
  VITE_LANGFUSE_SECRET_KEY: 'sk_dev_123456789',
  VITE_LANGFUSE_BASE_URL: 'https://cloud.langfuse.com',
  
  // Puerto para Vite
  VITE_PORT: '5176'
};

// Comprobar si existe el archivo .env.local
console.log('🔍 Verificando configuración de entorno...');

let existingVars = {};

if (existsSync(ENV_FILE)) {
  console.log('📄 Archivo .env.local encontrado');
  
  try {
    // Leer el archivo existente
    const content = readFileSync(ENV_FILE, 'utf-8');
    
    // Extraer las variables existentes
    content.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        existingVars[key.trim()] = value.trim();
      }
    });
    
    console.log('✅ Variables existentes cargadas');
  } catch (error) {
    console.error('❌ Error al leer el archivo .env.local:', error.message);
  }
} else {
  console.log('🆕 No se encontró archivo .env.local, se creará uno nuevo');
}

// Mezclar variables existentes con valores predeterminados
const mergedVars = { ...defaultEnvVars, ...existingVars };

// Generar contenido del archivo
const content = Object.entries(mergedVars)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

// Escribir el archivo
try {
  writeFileSync(ENV_FILE, content);
  console.log('✅ Archivo .env.local generado correctamente');
  
  // Mostrar resumen
  console.log('\n📋 Resumen de configuración:');
  console.log(`API URL: ${mergedVars.VITE_API_BASE_URL}`);
  console.log(`Langfuse: ${mergedVars.VITE_LANGFUSE_BASE_URL}`);
  console.log(`Puerto Vite: ${mergedVars.VITE_PORT}`);
} catch (error) {
  console.error('❌ Error al escribir el archivo .env.local:', error.message);
}

console.log('\n🚀 Configuración completada'); 