#!/usr/bin/env node

import { exec } from 'child_process';
import { platform } from 'os';

const PORT = 5175;

// Determinar el comando según el sistema operativo
const getCommand = () => {
  const os = platform();
  switch (os) {
    case 'win32':
      return `netstat -ano | findstr :${PORT} | findstr LISTENING`;
    case 'darwin': // macOS
      return `lsof -i :${PORT} | grep LISTEN`;
    default: // Linux y otros
      return `lsof -i :${PORT} | grep LISTEN`;
  }
};

const getKillCommand = (pid) => {
  const os = platform();
  return os === 'win32' ? `taskkill /F /PID ${pid}` : `kill -9 ${pid}`;
};

const extractPID = (output, os) => {
  if (!output) return null;
  
  try {
    if (os === 'win32') {
      const lines = output.split('\n');
      // La última columna contiene el PID en Windows
      for (const line of lines) {
        if (line.trim()) {
          const parts = line.trim().split(/\s+/);
          return parts[parts.length - 1];
        }
      }
    } else {
      // En macOS/Linux, el PID está en la segunda columna
      const lines = output.split('\n');
      for (const line of lines) {
        if (line.trim()) {
          const parts = line.trim().split(/\s+/);
          return parts[1];
        }
      }
    }
  } catch (err) {
    console.error('Error al extraer PID:', err);
  }
  return null;
};

console.log(`🔍 Buscando procesos que usen el puerto ${PORT}...`);

const os = platform();
exec(getCommand(), (error, stdout) => {
  if (error && !stdout) {
    console.log(`✅ No se encontró ningún proceso usando el puerto ${PORT}`);
    process.exit(0);
  }

  const pid = extractPID(stdout, os);
  
  if (!pid) {
    console.log(`✅ No se encontró ningún proceso usando el puerto ${PORT}`);
    process.exit(0);
  }

  console.log(`🔥 Matando proceso con PID ${pid}...`);
  
  exec(getKillCommand(pid), (killError) => {
    if (killError) {
      console.error(`❌ Error al matar el proceso: ${killError.message}`);
      process.exit(1);
    }
    console.log(`✅ Proceso con PID ${pid} terminado. Puerto ${PORT} liberado.`);
    process.exit(0);
  });
}); 