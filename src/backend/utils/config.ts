/**
 * Configuración de variables de entorno para el backend
 * Centraliza el acceso a las variables de entorno con valores por defecto
 */

import { config as dotenvConfig } from 'dotenv';

// Cargar variables de entorno desde .env
dotenvConfig();

// Definir tipo para la configuración
interface Config {
  NODE_ENV: string;
  PORT: number;
  ALLOWED_ORIGINS: string[];
  LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug';
  // Aquí se pueden agregar más variables según sea necesario
}

// Exportar la configuración con valores por defecto
export const config: Config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || 'http://localhost:5176,http://localhost:3000')
    .split(',')
    .map(origin => origin.trim()),
  LOG_LEVEL: (process.env.LOG_LEVEL as Config['LOG_LEVEL']) || 'info',
}; 