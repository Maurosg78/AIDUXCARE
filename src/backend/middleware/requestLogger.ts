/**
 * Middleware para registrar las solicitudes HTTP
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * Middleware que registra información sobre cada solicitud HTTP
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  // Guardar el tiempo de inicio
  const start = Date.now();
  
  // Capturar los datos originales de end para poder calcular el tiempo de respuesta
  const originalEnd = res.end;
  
  // Sobrescribir la función end para registrar después de que la respuesta se haya enviado
  res.end = function(this: Response, chunk?: any, encoding?: any, callback?: any) {
    // Calcular el tiempo transcurrido
    const responseTime = Date.now() - start;
    
    // Registrar la solicitud
    logger.request(
      req.method,
      req.originalUrl || req.url,
      res.statusCode,
      responseTime
    );
    
    // Llamar a la función original
    return originalEnd.call(this, chunk, encoding, callback);
  } as typeof res.end;
  
  next();
}; 