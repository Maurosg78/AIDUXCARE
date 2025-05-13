#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const BASE_CONFIG_PATH = path.join(__dirname, '../config/tsconfig.base.json');
const ROOT_DIR = path.join(__dirname, '../../');

function validateTsConfigs() {
  console.log('🔍 Validando configuraciones de TypeScript...\n');

  // Verificar que existe el archivo base
  if (!fs.existsSync(BASE_CONFIG_PATH)) {
    console.error('❌ No se encontró tsconfig.base.json');
    process.exit(1);
  }

  // Leer configuración base
  const baseConfig = JSON.parse(fs.readFileSync(BASE_CONFIG_PATH, 'utf8'));

  // Buscar todos los tsconfig.json en el proyecto
  const tsConfigs = findTsConfigs(ROOT_DIR);
  
  let hasErrors = false;

  // Validar cada tsconfig
  for (const configPath of tsConfigs) {
    console.log(`\n📄 Validando ${path.relative(ROOT_DIR, configPath)}...`);
    
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      // Verificar que extiende del base
      if (!config.extends || !config.extends.includes('typescript/config/tsconfig.base.json')) {
        console.error('❌ No extiende de tsconfig.base.json');
        hasErrors = true;
      }

      // Verificar paths duplicados
      if (config.compilerOptions?.paths) {
        const duplicatePaths = findDuplicatePaths(config.compilerOptions.paths, baseConfig.compilerOptions.paths);
        if (duplicatePaths.length > 0) {
          console.error('❌ Paths duplicados:', duplicatePaths);
          hasErrors = true;
        }
      }

      // Verificar exclusiones inconsistentes
      if (config.exclude) {
        const inconsistentExcludes = findInconsistentExcludes(config.exclude, baseConfig.exclude);
        if (inconsistentExcludes.length > 0) {
          console.error('❌ Exclusiones inconsistentes:', inconsistentExcludes);
          hasErrors = true;
        }
      }

    } catch (error) {
      console.error(`❌ Error al validar ${configPath}:`, error.message);
      hasErrors = true;
    }
  }

  if (hasErrors) {
    console.error('\n❌ Se encontraron errores en la validación');
    process.exit(1);
  } else {
    console.log('\n✅ Todas las configuraciones son válidas');
  }
}

function findTsConfigs(dir) {
  const results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      results.push(...findTsConfigs(fullPath));
    } else if (file === 'tsconfig.json' || file.match(/^tsconfig\..*\.json$/)) {
      results.push(fullPath);
    }
  }
  
  return results;
}

function findDuplicatePaths(configPaths, basePaths) {
  const duplicates = [];
  for (const [key, value] of Object.entries(configPaths)) {
    if (basePaths[key] && JSON.stringify(basePaths[key]) === JSON.stringify(value)) {
      duplicates.push(key);
    }
  }
  return duplicates;
}

function findInconsistentExcludes(configExcludes, baseExcludes) {
  return configExcludes.filter(exclude => !baseExcludes.includes(exclude));
}

validateTsConfigs(); 