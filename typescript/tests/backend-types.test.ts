/**
 * Tests para validar tipos del backend
 * 
 * Este archivo NO ejecuta pruebas reales, sino que verifica que los
 * tipos estén correctamente definidos y no haya errores de tipado.
 */

import { Request, Response, NextFunction } from 'express';
import { z } from '@/types/schema-utils';
import { createApiError, ApiError, notFoundHandler, errorHandler } from '@/backend/middleware/errorHandler';
import { requestLogger } from '@/backend/middleware/requestLogger';
import { 
  AdaptedRequestContext, 
  AdaptedExportPayload,
  AdaptedFHIRPatient,
  AdaptedLangfuseTrace,
  extractRequestContext,
  adaptExportPayload,
  adaptToFHIRPatient
} from '@/types/backend-adapters';

import { 
  validateAuthentication,
  validateAdminAccess,
  AuthenticatedRequest
} from '@/server/middleware/auth';

// Test para verificar que los tipos de error estén bien definidos
function testErrorTypes() {
  const error: ApiError = createApiError('Test error', 400, { details: 'error details' }, 'TEST_ERROR');
  
  // Verificar que los campos estén correctamente tipados
  const statusCode: number | undefined = error.statusCode;
  const details: unknown = error.details;
  const message: string = error.message;
  const code: string | undefined = error.code;
  
  // Verificar que el middleware pueda ser llamado correctamente
  const mockReq = {} as Request;
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  } as unknown as Response;
  const mockNext = jest.fn() as NextFunction;
  
  errorHandler(error, mockReq, mockRes, mockNext);
  notFoundHandler(mockReq, mockRes, mockNext);
}

// Test para verificar los tipos de middleware de solicitud
function testRequestLoggerTypes() {
  const mockReq = {
    method: 'GET',
    originalUrl: '/api/test',
    url: '/test'
  } as Request;
  
  const mockRes = {
    statusCode: 200,
    end: jest.fn()
  } as unknown as Response;
  
  const mockNext = jest.fn() as NextFunction;
  
  requestLogger(mockReq, mockRes, mockNext);
}

// Test para verificar los tipos de adaptadores backend
function testBackendAdapters() {
  // Verificar tipo AdaptedRequestContext
  const requestContext: AdaptedRequestContext = {
    userId: 'user-123',
    timestamp: new Date().toISOString(),
    userRole: 'admin'
  };
  
  // Verificar tipo AdaptedExportPayload
  const exportPayload: AdaptedExportPayload = {
    entity: 'patients',
    format: 'json',
    filters: {
      startDate: '2023-01-01',
      endDate: '2023-12-31'
    }
  };
  
  // Verificar tipo AdaptedFHIRPatient
  const fhirPatient: AdaptedFHIRPatient = {
    resourceType: 'Patient',
    id: 'p1',
    name: [
      {
        use: 'official',
        family: 'García',
        given: ['Juan']
      }
    ],
    gender: 'male',
    birthDate: '1975-08-15'
  };
  
  // Verificar tipo AdaptedLangfuseTrace
  const langfuseTrace: AdaptedLangfuseTrace = {
    id: 'trace-123',
    name: 'test-trace',
    metadata: {},
    serverContext: {
      requestId: 'req-123',
      nodeEnv: 'development'
    }
  };
  
  // Verificar las funciones adaptadoras
  const req = {} as Request;
  const ctx = extractRequestContext(req);
  
  const rawPayload = { entity: 'visits', format: 'csv' };
  const adaptedPayload = adaptExportPayload(rawPayload);
  
  const rawPatient = { 
    id: 'p1', 
    firstName: 'Juan', 
    lastName: 'García',
    birthDate: '1975-08-15',
    email: 'juan@example.com'
  };
  const adaptedPatient = adaptToFHIRPatient(rawPatient);
}

// Test para verificar los tipos de middleware de autenticación
function testAuthMiddlewares() {
  // Verificar el tipo AuthenticatedRequest
  const req: AuthenticatedRequest = {
    user: {
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'admin'
    }
  } as AuthenticatedRequest;
  
  const handler = (req: any, res: any) => Promise.resolve();
  
  // Verificar que los middlewares devuelvan el tipo correcto
  const authHandler = validateAuthentication(handler);
  const adminHandler = validateAdminAccess(handler);
}

// Test para verificar la integración con Zod
function testZodIntegration() {
  // Definir un esquema con Zod
  const UserSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    age: z.number().optional()
  });
  
  // Verificar que se pueda inferir el tipo
  type User = z.infer<typeof UserSchema>;
  
  // Crear una instancia válida
  const user: User = {
    id: 'user-123',
    name: 'Juan García',
    email: 'juan@example.com'
  };
  
  // Validar contra el esquema
  const validatedUser = UserSchema.parse(user);
}

// No se ejecuta ninguna función real, solo verificamos los tipos
export default {
  testErrorTypes,
  testRequestLoggerTypes,
  testBackendAdapters,
  testAuthMiddlewares,
  testZodIntegration
}; 