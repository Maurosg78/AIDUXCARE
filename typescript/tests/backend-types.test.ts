/**
 * Tests para validar tipos del backend
 * 
 * Este archivo NO ejecuta pruebas reales, sino que verifica que los
 * tipos estén correctamente definidos y no haya errores de tipado.
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { 
  createApiError, 
  createValidationError, 
  createAuthError, 
  createNotFoundError, 
  ApiError, 
  notFoundHandler, 
  errorHandler,
  BackendErrorType
} from '@/backend/middleware/errorHandler';
import { requestLogger, createRequestLogger, RequestLoggerOptions } from '@/backend/middleware/requestLogger';
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

import {
  validateBody,
  validateParams,
  validateQuery,
  FHIRPatientSchema,
  ExportPayloadSchema,
  PatientSchema,
  VisitSchema,
  ContextSchema,
  type FHIRPatient,
  type ExportPayload,
  type Patient,
  type Visit,
  type Context
} from '@/backend/utils/zod-utils';

import {
  FHIRResourceType,
  FHIRResource,
  FHIRObservation,
  FHIREncounter,
  FHIRBundle
} from '@/backend/routes/fhir';

// Test para verificar que los tipos de error estén bien definidos
function testErrorTypes() {
  const errorTypes: BackendErrorType[] = [
    'ValidationError',
    'AuthError',
    'NotFoundError',
    'ConflictError',
    'InternalError',
    'ExternalServiceError',
    'BusinessLogicError'
  ];
  
  // Verificar que se pueden crear errores con los diferentes tipos
  const validationError = createValidationError('Datos inválidos', [{ field: 'nombre', message: 'Requerido' }]);
  const authError = createAuthError('No autorizado');
  const notFoundError = createNotFoundError('Recurso no encontrado');
  const apiError = createApiError('Error genérico', 500, { details: 'error details' }, 'TEST_ERROR', 'InternalError');
  
  // Verificar que los campos estén correctamente tipados
  const statusCode: number | undefined = apiError.statusCode;
  const details: unknown = apiError.details;
  const message: string = apiError.message;
  const code: string | undefined = apiError.code;
  const type: BackendErrorType | undefined = apiError.type;
  
  // Verificar que el middleware pueda ser llamado correctamente
  const mockReq = {} as Request;
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  } as unknown as Response;
  const mockNext = jest.fn() as NextFunction;
  
  errorHandler(apiError, mockReq, mockRes, mockNext);
  notFoundHandler(mockReq, mockRes, mockNext);
}

// Test para verificar los tipos de middleware de solicitud
function testRequestLoggerTypes() {
  const mockReq = {
    method: 'GET',
    originalUrl: '/api/test',
    url: '/test',
    headers: {},
    ip: '127.0.0.1'
  } as Request;
  
  const mockRes = {
    statusCode: 200,
    end: jest.fn()
  } as unknown as Response;
  
  const mockNext = jest.fn() as NextFunction;
  
  // Probar opciones personalizadas
  const options: RequestLoggerOptions = {
    logBody: true,
    logHeaders: true,
    excludePaths: ['/health', '/metrics'],
    sensitiveHeaders: ['authorization', 'x-api-key']
  };
  
  // Crear logger personalizado
  const customLogger = createRequestLogger(options);
  
  // Usar loggers
  requestLogger(mockReq, mockRes, mockNext);
  customLogger(mockReq, mockRes, mockNext);
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
  // Verificar esquemas FHIR
  const fhirPatientData = {
    resourceType: 'Patient',
    id: 'patient-123',
    name: [{ family: 'Smith', given: ['John'] }],
    gender: 'male'
  };
  
  // Verificar parseo
  const validatedFhirPatient = FHIRPatientSchema.parse(fhirPatientData);
  const extractedPatient: FHIRPatient = validatedFhirPatient;
  
  // Verificar esquemas MCP
  const patientData = {
    id: 'pat-123',
    nombre: 'Juan García',
    edad: 45,
    email: 'juan@example.com'
  };
  
  const validatedPatient = PatientSchema.parse(patientData);
  const extractedPatientMCP: Patient = validatedPatient;
  
  // Verificar funciones de validación
  const mockReq = {
    body: { id: 'test', name: 'Test' },
    params: { id: '123' },
    query: { page: '1', limit: '10' }
  } as unknown as Request;
  
  const bodySchema = z.object({ id: z.string(), name: z.string() });
  const paramsSchema = z.object({ id: z.string() });
  const querySchema = z.object({ page: z.string(), limit: z.string() });
  
  try {
    const body = validateBody(bodySchema, mockReq);
    const params = validateParams(paramsSchema, mockReq);
    const query = validateQuery(querySchema, mockReq);
  } catch (error) {
    // En una aplicación real, se manejaría el error
  }
}

// Test para verificar los tipos de rutas FHIR
function testFHIRRouteTypes() {
  // Verificar tipos de recursos
  const resourceTypes: FHIRResourceType[] = ['Patient', 'Observation', 'Encounter'];
  
  // Verificar recursos específicos
  const patientResource: FHIRResource = {
    id: 'patient-123',
    resourceType: 'Patient'
  };
  
  const observationResource: FHIRObservation = {
    id: 'obs-123',
    resourceType: 'Observation',
    status: 'final',
    code: { text: 'Pulso' },
    subject: { reference: 'Patient/patient-123' }
  };
  
  const encounterResource: FHIREncounter = {
    id: 'enc-123',
    resourceType: 'Encounter',
    status: 'finished',
    class: { code: 'AMB' },
    subject: { reference: 'Patient/patient-123' }
  };
  
  // Verificar tipo de bundle
  const bundle: FHIRBundle<FHIRResource> = {
    resourceType: 'Bundle',
    type: 'searchset',
    total: 1,
    entry: [{ resource: patientResource }]
  };
}

// No se ejecuta ninguna función real, solo verificamos los tipos
export default {
  testErrorTypes,
  testRequestLoggerTypes,
  testBackendAdapters,
  testAuthMiddlewares,
  testZodIntegration,
  testFHIRRouteTypes
}; 