#!/usr/bin/env node

import { spawn } from 'child_process';
import { Console } from 'console';

const console = new Console(process.stdout, process.stderr);

const STEPS = [
  { name: 'Liberar puerto 5175', command: 'npm', args: ['run', 'free-port'] },
  { name: 'Configurar variables de entorno', command: 'npm', args: ['run', 'setup-env'] },
  { name: 'Verificar configuración', command: 'npm', args: ['run', 'check:env'] }
];

console.log('🚀 Iniciando configuración de AiDuxCare v1.15...\n');

async function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command exited with code ${code}`));
      }
    });
    
    child.on('error', (err) => {
      reject(err);
    });
  });
}

async function runSteps() {
  for (let i = 0; i < STEPS.length; i++) {
    const step = STEPS[i];
    console.log(`\n📋 Paso ${i + 1}/${STEPS.length}: ${step.name}`);
    
    try {
      await runCommand(step.command, step.args);
      console.log(`✅ ${step.name} completado`);
    } catch (error) {
      console.error(`❌ Error en ${step.name}:`, error.message);
      console.error('Abortando proceso de configuración');
      process.exit(1);
    }
  }
  
  console.log('\n🎉 Configuración completada con éxito');
  console.log('\nPara iniciar el proyecto completo:');
  console.log('  npm run dev:all');
  console.log('\nPara iniciar solo el frontend:');
  console.log('  npm run dev');
  console.log('\nPara iniciar solo el servidor API:');
  console.log('  node simple-server.mjs');
}

runSteps().catch(err => {
  console.error('Error inesperado:', err);
  process.exit(1);
}); 