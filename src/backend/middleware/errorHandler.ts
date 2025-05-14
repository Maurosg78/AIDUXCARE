/**
 * Middleware para manejo centralizado de errores
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.js';

// Tipos de error discriminados
export type BackendErrorType = 
  | 'ValidationError'    // Errores de validación de datos
  | 'AuthError'          // Errores de autenticación/autorización
  | 'NotFoundError'      // Recursos no encontrados
  | 'ConflictError'      // Conflictos de datos (ej: duplicados)
  | 'InternalError'      // Errores internos del servidor
  | 'ExternalServiceError' // Errores de servicios externos
  | 'BusinessLogicError';  // Errores de lógica de negocio

// Interfaz base para errores personalizados con código de estado HTTP
export interface ApiError extends Error {
  type?: BackendErrorType;
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
    type?: BackendErrorType;
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

// Mapa de tipos de error a códigos de estado HTTP
const errorTypeToStatusCode: Record<BackendErrorType, number> = {
  ValidationError: 400,
  AuthError: 401,
  NotFoundError: 404,
  ConflictError: 409,
  BusinessLogicError: 422,
  ExternalServiceError: 502,
  InternalError: 500
};

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
  const statusCode = err.statusCode || 
    (err.type ? errorTypeToStatusCode[err.type] : 500);
  
  // Registrar el error
  logger.error(`${statusCode} - ${err.message}`, {
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    errorType: err.type || 'UnknownError',
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
      type: err.type,
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
  code?: string,
  type?: BackendErrorType
): ApiError => {
  const error: ApiError = new Error(message);
  error.statusCode = statusCode;
  error.details = details;
  error.type = type || 'InternalError';
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
  error.type = 'ValidationError';
  error.code = 'VALIDATION_ERROR';
  error.validationErrors = validationErrors;
  return error;
};

/**
 * Helper para crear errores de autenticación
 */
export const createAuthError = (
  message: string,
  code: string = 'UNAUTHORIZED'
): ApiError => {
  const error: ApiError = new Error(message);
  error.statusCode = 401;
  error.type = 'AuthError';
  error.code = code;
  return error;
};

/**
 * Helper para crear errores de recurso no encontrado
 */
export const createNotFoundError = (
  message: string,
  resourceId?: string
): ApiError => {
  const error: ApiError = new Error(message);
  error.statusCode = 404;
  error.type = 'NotFoundError';
  error.code = 'NOT_FOUND';
  if (resourceId) {
    error.details = { resourceId };
  }
  return error;
};

// Error 404 - Recurso no encontrado
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  const err = createNotFoundError(`Ruta no encontrada: ${req.originalUrl}`);
  next(err);
}; 