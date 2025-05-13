/**
 * Middleware para manejo centralizado de errores
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Interfaz para errores personalizados con código de estado HTTP
interface ApiError extends Error {
  statusCode?: number;
  details?: unknown;
}

/**
 * Middleware para manejar errores de forma centralizada
 */
export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Determinar el código de estado (por defecto 500)
  const statusCode = err.statusCode || 500;
  
  // Registrar el error
  logger.error(`${statusCode} - ${err.message}`, {
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    details: err.details || err.stack
  });
  
  // Determinar qué información enviar al cliente basado en el entorno
  const isProduction = process.env.NODE_ENV === 'production';
  
  // En producción no enviamos detalles técnicos
  const responseBody = {
    success: false,
    error: {
      message: err.message,
      ...(isProduction ? {} : {
        stack: err.stack,
        details: err.details
      })
    }
  };
  
  // Enviar respuesta
  res.status(statusCode).json(responseBody);
};

/**
 * Helper para crear errores de API con código de estado
 */
export const createApiError = (message: string, statusCode: number, details?: unknown): ApiError => {
  const error: ApiError = new Error(message);
  error.statusCode = statusCode;
  error.details = details;
  return error;
};

// Error 404 - Recurso no encontrado
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const err: ApiError = new Error(`Ruta no encontrada: ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
}; 