/**
 * Middleware de CORS seguro que permite solo orígenes definidos en las variables de entorno
 */

import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Obtener los orígenes permitidos desde variables de entorno
const getAllowedOrigins = (): string[] => {
  const configuredOrigins = process.env.ALLOWED_ORIGINS || '';
  // Si no hay orígenes definidos, permitimos localhost por defecto en desarrollo
  if (!configuredOrigins && process.env.NODE_ENV === 'development') {
    return ['http://localhost:5176', 'http://localhost:3000'];
  }
  return configuredOrigins.split(',').map(origin => origin.trim());
};

// Opciones de CORS
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    // Permitir solicitudes sin origen (como curl o aplicaciones móviles)
    if (!origin) {
      return callback(null, true);
    }
    
    // Comprobar si el origen está en la lista de permitidos
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      logger.error(`Acceso CORS bloqueado para: ${origin}`);
      return callback(new Error(`El origen ${origin} no está permitido por CORS`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400, // 24 horas de caché de preflight
};

// Middleware de CORS
export const corsMiddleware = cors(corsOptions);

// Middleware para logging de CORS
export const corsLogger = (req: Request, res: Response, next: NextFunction): void => {
  const origin = req.headers.origin;
  if (origin) {
    logger.info(`CORS: Solicitud recibida desde ${origin}`);
  }
  next();
};

export default {
  corsMiddleware,
  corsLogger
}; 