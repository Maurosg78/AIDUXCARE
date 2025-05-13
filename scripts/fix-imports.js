#!/usr/bin/env node

/**
 * Script para corregir automáticamente problemas comunes de importación en TypeScript
 * Uso: node scripts/fix-imports.js
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Configuración
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const tsFiles = execSync(`find ${rootDir}/src -type f -name "*.tsx" -o -name "*.ts"`)
  .toString()
  .split('\n')
  .filter(Boolean);

// Patrones de reemplazo
const replacements = [
  // Convertir importaciones de React a modern syntax
  {
    pattern: /import React(\s*),\s*\{\s*([^}]+)\s*\}\s*from\s*['"]react['"]/g,
    replacement: "import { $2 } from 'react'"
  },
  // Convertir importaciones regulares a importaciones de tipo 
  {
    pattern: /import\s*\{\s*([^}]+)\s*\}\s*from\s*['"](.*types?.*)['"]/g,
    replacement: "import type { $1 } from '$2'"
  },
  // Arreglar prefijos de variables no utilizadas
  {
    pattern: /const\s+([\w\d]+)(\s*=\s*[^;]+;\s*\/\/\s*eslint-disable-line\s+@typescript-eslint\/no-unused-vars)/g,
    replacement: "const _$1$2"
  }
];

console.log(`🔍 Analizando ${tsFiles.length} archivos TypeScript...`);

// Contador de archivos modificados
let modifiedFiles = 0;

// Procesar cada archivo
tsFiles.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Aplicar cada patrón de reemplazo
    replacements.forEach(({ pattern, replacement }) => {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });
    
    // Guardar el archivo si se modificó
    if (modified) {
      fs.writeFileSync(filePath, content);
      modifiedFiles++;
      console.log(`✅ Corregido: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
  }
});

console.log(`\n🎉 Proceso completado. ${modifiedFiles} archivos modificados.`);

// Ejecutar ESLint para verificar si quedan problemas
console.log('\n📋 Ejecutando ESLint para verificar resultados...');
try {
  const eslintOutput = execSync(`npx eslint "${rootDir}/src/**/*.{ts,tsx}" --quiet`).toString();
  console.log('✨ No se encontraron problemas de linting.');
} catch (error) {
  console.log('⚠️ Algunos problemas de linting persisten. Revisar manualmente.');
  console.log(error.stdout?.toString() || error.message);
} 