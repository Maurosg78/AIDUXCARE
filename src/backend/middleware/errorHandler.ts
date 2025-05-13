/**
 * Middleware para manejo centralizado de errores
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Interfaz para errores personalizados con código de estado HTTP
export interface ApiError extends Error {
  statusCode?: number;
  details?: unknown;
  code?: string;
  validationErrors?: Array<{ 
    field: string;
    message: string;
    value?: unknown;
  }>;
}

// Tipo para la respuesta del error
export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string | undefined;
    stack?: string | undefined;
    details?: unknown | undefined;
    validationErrors?: Array<{ 
      field: string;
      message: string;
      value?: unknown | undefined;
    }> | undefined;
  };
}

/**
 * Middleware para manejar errores de forma centralizada
 */
export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Determinar el código de estado (por defecto 500)
  const statusCode = err.statusCode || 500;
  
  // Registrar el error
  logger.error(`${statusCode} - ${err.message}`, {
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    details: err.details || err.stack,
    code: err.code
  });
  
  // Determinar qué información enviar al cliente basado en el entorno
  const isProduction = process.env.NODE_ENV === 'production';
  
  // En producción no enviamos detalles técnicos
  const responseBody: ErrorResponse = {
    success: false,
    error: {
      message: err.message,
      code: err.code,
      ...(isProduction ? {} : {
        stack: err.stack,
        details: err.details,
        validationErrors: err.validationErrors
      })
    }
  };
  
  // Enviar respuesta
  res.status(statusCode).json(responseBody);
};

/**
 * Helper para crear errores de API con código de estado
 */
export const createApiError = (
  message: string, 
  statusCode: number, 
  details?: unknown,
  code?: string
): ApiError => {
  const error: ApiError = new Error(message);
  error.statusCode = statusCode;
  error.details = details;
  if (code) {
    error.code = code;
  }
  return error;
};

/**
 * Helper para crear errores de validación
 */
export const createValidationError = (
  message: string,
  validationErrors: Array<{ field: string; message: string; value?: unknown }>
): ApiError => {
  const error: ApiError = new Error(message);
  error.statusCode = 400;
  error.code = 'VALIDATION_ERROR';
  error.validationErrors = validationErrors;
  return error;
};

// Error 404 - Recurso no encontrado
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  const err: ApiError = new Error(`Ruta no encontrada: ${req.originalUrl}`);
  err.statusCode = 404;
  err.code = 'NOT_FOUND';
  next(err);
}; 