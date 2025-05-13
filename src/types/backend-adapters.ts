/**
 * Adaptadores de tipos específicos para el backend
 * 
 * Este archivo define interfaces adaptadas para usar en controladores,
 * rutas y servicios en el lado del servidor que requieren compatibilidad
 * con diferentes estructuras de datos.
 */
import { Request } from 'express';
import { Session } from 'next-auth';
import { LangfuseTrace } from './langfuse-events';

/**
 * Contexto de solicitud adaptado para controladores
 */
export interface AdaptedRequestContext {
  userId: string;
  sessionId?: string | undefined;
  userRole?: string | undefined;
  timestamp: string;
  ip?: string | undefined;
  userAgent?: string | undefined;
  referer?: string | undefined;
  requestId?: string | undefined;
  [key: string]: unknown;
}

/**
 * Payload adaptado para exportación de datos
 */
export interface AdaptedExportPayload {
  entity: string;
  format: 'json' | 'csv' | 'pdf' | 'xlsx';
  filters?: {
    startDate?: string | undefined;
    endDate?: string | undefined;
    patientId?: string | undefined;
    visitId?: string | undefined;
    profesionalId?: string | undefined;
    status?: string | undefined;
    [key: string]: unknown | undefined;
  } | undefined;
  options?: {
    includeDeleted?: boolean | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: string | undefined;
    sortOrder?: 'asc' | 'desc' | undefined;
    [key: string]: unknown | undefined;
  } | undefined;
  metadata?: Record<string, unknown> | undefined;
}

/**
 * Paciente adaptado en formato FHIR para interoperabilidad
 */
export interface AdaptedFHIRPatient {
  resourceType: 'Patient';
  id: string;
  meta?: {
    versionId?: string | undefined;
    lastUpdated?: string | undefined;
    source?: string | undefined;
  } | undefined;
  identifier?: Array<{
    system?: string | undefined;
    value: string;
    type?: {
      coding: Array<{
        system: string;
        code: string;
        display?: string | undefined;
      }>;
    } | undefined;
  }> | undefined;
  active?: boolean | undefined;
  name?: Array<{
    use?: string | undefined;
    text?: string | undefined;
    family?: string | undefined;
    given?: string[] | undefined;
  }> | undefined;
  telecom?: Array<{
    system?: string | undefined;
    value?: string | undefined;
    use?: string | undefined;
  }> | undefined;
  gender?: string | undefined;
  birthDate?: string | undefined;
  address?: Array<{
    use?: string | undefined;
    type?: string | undefined;
    line?: string[] | undefined;
    city?: string | undefined;
    state?: string | undefined;
    postalCode?: string | undefined;
    country?: string | undefined;
  }> | undefined;
  [key: string]: unknown;
}

/**
 * Trace de Langfuse adaptado para uso en backend
 */
export interface AdaptedLangfuseTrace extends LangfuseTrace {
  serverContext?: {
    requestId?: string | undefined;
    nodeEnv?: string | undefined;
    route?: string | undefined;
    method?: string | undefined;
    [key: string]: unknown | undefined;
  } | undefined;
}

/**
 * Adaptador para tipos de sesión de usuario
 */
export interface AdaptedUserSession {
  id: string;
  user: {
    id: string;
    name?: string | undefined;
    email?: string | undefined;
    role?: string | undefined;
    permissions?: string[] | undefined;
  };
  expires: string;
  [key: string]: unknown;
}

/**
 * Función para extraer el contexto de solicitud de Express
 */
export function extractRequestContext(req: Request, session?: Session | null): AdaptedRequestContext {
  return {
    userId: (session?.user as { id?: string })?.id || 'anonymous',
    sessionId: req.headers['x-session-id'] as string || undefined,
    userRole: (session?.user as any)?.role || 'guest',
    timestamp: new Date().toISOString(),
    ip: req.ip || req.headers['x-forwarded-for'] as string || undefined,
    userAgent: req.headers['user-agent'] || undefined,
    referer: req.headers.referer || undefined,
    requestId: req.headers['x-request-id'] as string || undefined
  };
}

/**
 * Función para adaptar un payload de exportación
 */
export function adaptExportPayload(payload: Record<string, unknown>): AdaptedExportPayload {
  return {
    entity: payload.entity as string,
    format: (payload.format || 'json') as AdaptedExportPayload['format'],
    filters: payload.filters as AdaptedExportPayload['filters'],
    options: payload.options as AdaptedExportPayload['options'],
    metadata: payload.metadata as Record<string, unknown>
  };
}

/**
 * Función para mapear un paciente al formato FHIR
 */
export function adaptToFHIRPatient(patientData: Record<string, unknown>): AdaptedFHIRPatient {
  const patient: AdaptedFHIRPatient = {
    resourceType: 'Patient',
    id: patientData.id as string
  };

  // Establecer identificadores
  if (patientData.id) {
    patient.identifier = [
      {
        system: 'urn:oid:1.2.840.114350.1.13.0.1.7.5.737384.14',
        value: patientData.id as string
      }
    ];
  }

  // Establecer nombre
  if (patientData.firstName || patientData.lastName || patientData.name) {
    patient.name = [
      {
        use: 'official',
        text: patientData.name as string || `${patientData.firstName || ''} ${patientData.lastName || ''}`.trim(),
        family: patientData.lastName as string,
        given: patientData.firstName ? [patientData.firstName as string] : undefined
      }
    ];
  }

  // Establecer fecha de nacimiento
  if (patientData.birthDate || patientData.dateOfBirth) {
    patient.birthDate = (patientData.birthDate || patientData.dateOfBirth) as string;
  }

  // Establecer género
  if (patientData.gender) {
    patient.gender = patientData.gender as string;
  }

  // Establecer información de contacto
  const telecom: AdaptedFHIRPatient['telecom'] = [];
  
  if (patientData.email || (patientData.contactInfo as any)?.email) {
    telecom.push({
      system: 'email',
      value: patientData.email as string || (patientData.contactInfo as any)?.email as string
    });
  }
  
  if (patientData.phone || (patientData.contactInfo as any)?.phone) {
    telecom.push({
      system: 'phone',
      value: patientData.phone as string || (patientData.contactInfo as any)?.phone as string
    });
  }
  
  if (telecom.length > 0) {
    patient.telecom = telecom;
  }

  return patient;
} 