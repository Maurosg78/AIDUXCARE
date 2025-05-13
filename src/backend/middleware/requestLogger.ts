/**
 * Middleware para registro y monitoreo de solicitudes HTTP
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { AdaptedRequestContext } from '@/types/backend-adapters';

/**
 * Opciones de configuración para el logger de solicitudes
 */
export interface RequestLoggerOptions {
  /** Determina si se deben registrar los cuerpos de las solicitudes */
  logBody?: boolean;
  /** Determina si se deben registrar las cabeceras de las solicitudes */
  logHeaders?: boolean;
  /** Lista de rutas que deben ser excluidas del registro */
  excludePaths?: string[];
  /** Lista de cabeceras sensibles a ocultar */
  sensitiveHeaders?: string[];
}

// Opciones predeterminadas
const defaultOptions: RequestLoggerOptions = {
  logBody: false,
  logHeaders: false,
  excludePaths: ['/health', '/favicon.ico'],
  sensitiveHeaders: ['authorization', 'cookie', 'set-cookie']
};

// Definir tipos para los argumentos del método end
type ResponseEndArgs = [
  chunk?: any,
  encoding?: BufferEncoding,
  callback?: () => void
];

/**
 * Crea un middleware para registrar solicitudes HTTP
 */
export function createRequestLogger(options: RequestLoggerOptions = {}): (req: Request, res: Response, next: NextFunction) => void {
  // Combinar opciones predeterminadas con las proporcionadas
  const opts: RequestLoggerOptions = { ...defaultOptions, ...options };

  return (req: Request, res: Response, next: NextFunction): void => {
    // Ignorar rutas excluidas
    if (opts.excludePaths?.some(path => req.path.startsWith(path))) {
      return next();
    }

    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] as string || `req-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    
    // Extraer contexto de la solicitud
    const requestContext: Omit<AdaptedRequestContext, 'userRole'> = {
      userId: 'anonymous',
      timestamp: new Date().toISOString(),
      ip: req.ip || req.headers['x-forwarded-for'] as string || undefined,
      userAgent: req.headers['user-agent'] || undefined,
      referer: req.headers.referer || undefined,
      requestId,
    };
    
    // Registrar inicio de solicitud
    logger.info(`Solicitud recibida: ${req.method} ${req.originalUrl || req.url}`, {
      method: req.method,
      path: req.originalUrl || req.url,
      query: req.query,
      ...(opts.logBody ? { body: req.body } : {}),
      ...(opts.logHeaders ? { 
        headers: filterSensitiveHeaders(req.headers, opts.sensitiveHeaders || []) 
      } : {}),
      requestContext
    });
    
    // Interceptar finalización de respuesta para registrar resultados
    const originalEnd = res.end;
    res.end = function(this: Response, ...args: ResponseEndArgs): Response {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      logger.info(`Respuesta enviada: ${req.method} ${req.originalUrl || req.url} - ${res.statusCode} (${duration}ms)`, {
        method: req.method,
        path: req.originalUrl || req.url,
        statusCode: res.statusCode,
        duration,
        requestId
      });
      
      // Restaurar y llamar al método original
      return originalEnd.apply(this, args);
    };
    
    next();
  };
}

// Filtrar cabeceras sensibles
function filterSensitiveHeaders(headers: Record<string, unknown>, sensitiveHeaders: string[]): Record<string, unknown> {
  const filtered: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(headers)) {
    if (sensitiveHeaders.includes(key.toLowerCase())) {
      filtered[key] = '******';
    } else {
      filtered[key] = value;
    }
  }
  
  return filtered;
}

// Exportar la versión predeterminada del middleware
export const requestLogger = createRequestLogger(); 