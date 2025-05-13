/**
 * Utilidades de validación con Zod para el backend
 * 
 * Este archivo proporciona esquemas, funciones de validación y utilidades
 * para trabajar con datos en el backend utilizando Zod.
 */

import { z } from 'zod';
import { Request } from 'express';
import { createValidationError } from '../middleware/errorHandler';

// Re-exportamos z para facilitar su uso
export { z };

// Esquemas FHIR
export const FHIRPatientSchema = z.object({
  resourceType: z.literal('Patient'),
  id: z.string(),
  meta: z.object({
    versionId: z.string().optional(),
    lastUpdated: z.string().optional(),
    source: z.string().optional(),
  }).optional(),
  name: z.array(z.object({
    use: z.string().optional(),
    text: z.string().optional(),
    family: z.string().optional(),
    given: z.array(z.string()).optional(),
  })).optional(),
  gender: z.string().optional(),
  birthDate: z.string().optional(),
  telecom: z.array(z.object({
    system: z.string().optional(),
    value: z.string().optional(),
    use: z.string().optional(),
  })).optional(),
});

export type FHIRPatient = z.infer<typeof FHIRPatientSchema>;

// Esquemas para exportación
export const ExportPayloadSchema = z.object({
  entity: z.string(),
  format: z.enum(['json', 'csv', 'pdf', 'xlsx']),
  filters: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    patientId: z.string().optional(),
    visitId: z.string().optional(),
    profesionalId: z.string().optional(),
    status: z.string().optional(),
  }).optional(),
  options: z.object({
    includeDeleted: z.boolean().optional(),
    limit: z.number().optional(),
    page: z.number().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type ExportPayload = z.infer<typeof ExportPayloadSchema>;

// Esquemas para MCP
export const PatientSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  edad: z.number(),
  email: z.string().email(),
});

export type Patient = z.infer<typeof PatientSchema>;

export const VisitSchema = z.object({
  id: z.string().optional(),
  paciente_id: z.string(),
  fecha: z.string(),
  motivo: z.string(),
  doctor: z.string(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Visit = z.infer<typeof VisitSchema>;

export const ContextSchema = z.object({
  instalacion: z.string(),
  version: z.string(),
  modulos_activos: z.array(z.string()),
  configuracion: z.object({
    idioma_defecto: z.string(),
    tema: z.string(),
    timeout_sesion: z.number(),
  }),
  estadisticas: z.object({
    pacientes_activos: z.number(),
    visitas_hoy: z.number(),
    visitas_pendientes: z.number(),
  }),
});

export type Context = z.infer<typeof ContextSchema>;

// Funciones de utilidad

/**
 * Valida req.body contra un esquema Zod
 * @param schema Esquema Zod para validar
 * @param req Request de Express
 * @returns Datos validados y tipados
 */
export function validateBody<T extends z.ZodType>(schema: T, req: Request): z.infer<T> {
  try {
    return schema.parse(req.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createValidationError(
        'Error de validación en el cuerpo de la solicitud',
        error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          value: err.message.includes('Required') ? undefined : err.input
        }))
      );
    }
    throw error;
  }
}

/**
 * Valida req.params contra un esquema Zod
 * @param schema Esquema Zod para validar
 * @param req Request de Express
 * @returns Datos validados y tipados
 */
export function validateParams<T extends z.ZodType>(schema: T, req: Request): z.infer<T> {
  try {
    return schema.parse(req.params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createValidationError(
        'Error de validación en los parámetros de la solicitud',
        error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          value: err.message.includes('Required') ? undefined : err.input
        }))
      );
    }
    throw error;
  }
}

/**
 * Valida req.query contra un esquema Zod
 * @param schema Esquema Zod para validar
 * @param req Request de Express
 * @returns Datos validados y tipados
 */
export function validateQuery<T extends z.ZodType>(schema: T, req: Request): z.infer<T> {
  try {
    return schema.parse(req.query);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createValidationError(
        'Error de validación en los parámetros de consulta',
        error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          value: err.message.includes('Required') ? undefined : err.input
        }))
      );
    }
    throw error;
  }
} 