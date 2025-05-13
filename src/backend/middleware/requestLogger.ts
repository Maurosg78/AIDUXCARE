/**
 * Middleware para registrar las solicitudes HTTP
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Definir el tipo para los parámetros de respuesta end
type ResponseEndArgs = [
  chunk?: unknown,
  encoding?: BufferEncoding,
  callback?: () => void
];

/**
 * Middleware que registra información sobre cada solicitud HTTP
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  // Guardar el tiempo de inicio
  const start = Date.now();
  
  // Capturar los datos originales de end para poder calcular el tiempo de respuesta
  const originalEnd = res.end;
  
  // Sobrescribir la función end para registrar después de que la respuesta se haya enviado
  res.end = function(
    this: Response,
    chunk?: unknown,
    encoding?: BufferEncoding | undefined,
    callback?: (() => void) | undefined
  ) {
    // Calcular el tiempo transcurrido
    const responseTime = Date.now() - start;
    
    // Registrar la solicitud
    logger.request(
      req.method,
      req.originalUrl || req.url,
      res.statusCode,
      responseTime
    );
    
    // Llamar a la función original con los argumentos originales
    const bufferEncoding = encoding as BufferEncoding;
    return originalEnd.call(this, chunk, bufferEncoding, callback);
  } as typeof res.end;
  
  next();
}; 