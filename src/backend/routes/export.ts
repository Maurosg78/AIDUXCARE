/**
 * Rutas para la exportación de datos
 */

import { Router, Request, Response, NextFunction } from 'express';
import { createApiError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';
import { z, validateBody, validateQuery } from '../utils/zod-utils.js';

// Esquemas de validación Zod
const ExportPatientParamsSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  includeInactive: z.boolean().optional(),
});

const ExportVisitParamsSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  patientId: z.string().optional(),
  status: z.string().optional(),
});

const ExportPdfParamsSchema = z.object({
  type: z.string(),
  id: z.string().optional(),
});

const ExportCsvPayloadSchema = z.object({
  entity: z.string(),
  filters: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    patientId: z.string().optional(),
    status: z.string().optional(),
  }).optional(),
  options: z.object({
    includeDeleted: z.boolean().optional(),
    format: z.string().optional(),
  }).optional(),
});

// Estos tipos se infieren directamente en el código
// a través de las funciones de validación

// Tipo para respuesta de exportación estándar
interface ExportResponse<T> {
  success: true;
  generated_at: string;
  count: number;
  filters?: unknown;
  data: T[];
}

// Tipo para paciente
interface Patient {
  id: string;
  nombre: string;
  edad: number;
  email: string;
}

// Tipo para visita
interface Visit {
  id: string;
  paciente_id: string;
  fecha: string;
  motivo: string;
  doctor: string;
}

// Crear el router para las rutas de exportación
export const exportRoutes = (): Router => {
  const router = Router();

  // Exportar datos de pacientes (en formato JSON)
  router.get('/patients', async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validar parámetros con Zod
      const params = validateQuery(ExportPatientParamsSchema, req);
      
      // Extraer contexto de la solicitud
      const requestContext = {
        userId: req.headers['x-user-id'] as string || 'anonymous',
        timestamp: new Date().toISOString()
      };
      
      logger.info('Exportación: Generando export de pacientes', {
        params,
        requestContext
      });
      
      // Mock de datos tipados para demostración
      const patients: Patient[] = [
        { id: 'pat-001', nombre: 'Juan Pérez', edad: 45, email: 'juan@example.com' },
        { id: 'pat-002', nombre: 'María López', edad: 38, email: 'maria@example.com' },
        { id: 'pat-003', nombre: 'Carlos Rodríguez', edad: 52, email: 'carlos@example.com' }
      ];
      
      // Establecer headers para descarga
      res.setHeader('Content-Disposition', 'attachment; filename=patients-export.json');
      res.setHeader('Content-Type', 'application/json');
      
      const responseBody: ExportResponse<Patient> = {
        success: true,
        generated_at: new Date().toISOString(),
        count: patients.length,
        filters: params,
        data: patients
      };
      
      res.json(responseBody);
    } catch (error) {
      next(error);
    }
  });

  // Exportar datos de visitas (en formato JSON)
  router.get('/visits', async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validar parámetros con Zod
      const params = validateQuery(ExportVisitParamsSchema, req);
      
      // Extraer contexto de la solicitud
      const requestContext = {
        userId: req.headers['x-user-id'] as string || 'anonymous',
        timestamp: new Date().toISOString()
      };
      
      logger.info('Exportación: Generando export de visitas', {
        params,
        requestContext
      });
      
      // Mock de datos tipados para demostración
      const visits: Visit[] = [
        { 
          id: 'visit-001', 
          paciente_id: 'pat-001', 
          fecha: '2023-05-10T09:30:00Z', 
          motivo: 'Control periódico',
          doctor: 'Dra. García'
        },
        { 
          id: 'visit-002', 
          paciente_id: 'pat-001', 
          fecha: '2023-06-15T14:00:00Z', 
          motivo: 'Malestar estomacal',
          doctor: 'Dr. Rodríguez'
        },
        { 
          id: 'visit-003', 
          paciente_id: 'pat-002', 
          fecha: '2023-07-22T10:15:00Z', 
          motivo: 'Dolor de cabeza',
          doctor: 'Dr. Martínez'
        }
      ];
      
      // Filtrar por ID de paciente si se proporciona
      let filteredVisits = visits;
      if (params.patientId) {
        filteredVisits = visits.filter(v => v.paciente_id === params.patientId);
      }
      
      // Establecer headers para descarga
      res.setHeader('Content-Disposition', 'attachment; filename=visits-export.json');
      res.setHeader('Content-Type', 'application/json');
      
      const responseBody: ExportResponse<Visit> = {
        success: true,
        generated_at: new Date().toISOString(),
        filters: params,
        count: filteredVisits.length,
        data: filteredVisits
      };
      
      res.json(responseBody);
    } catch (error) {
      next(error);
    }
  });

  // Exportar datos en formato CSV (general)
  router.post('/csv', async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validar el payload con Zod
      const validatedPayload = validateBody(ExportCsvPayloadSchema, req);
      
      // Convertir a nuestro tipo adaptado
      const exportPayload: ExportPayload = {
        entity: validatedPayload.entity,
        format: 'csv',
        filters: validatedPayload.filters,
        options: {
          includeDeleted: validatedPayload.options?.includeDeleted
        }
      };
      
      // Extraer contexto de la solicitud
      const requestContext = {
        userId: req.headers['x-user-id'] as string || 'anonymous',
        timestamp: new Date().toISOString()
      };
      
      logger.info(`Exportación: Generando export de ${exportPayload.entity} en formato CSV`, {
        filters: exportPayload.filters,
        requestContext
      });
      
      // Mock de datos CSV para demostración
      let csvData: string;
      
      if (exportPayload.entity === 'patients') {
        csvData = 'id,nombre,edad,email\n'
                + 'pat-001,Juan Pérez,45,juan@example.com\n'
                + 'pat-002,María López,38,maria@example.com\n'
                + 'pat-003,Carlos Rodríguez,52,carlos@example.com\n';
      } else if (exportPayload.entity === 'visits') {
        csvData = 'id,paciente_id,fecha,motivo,doctor\n'
                + 'visit-001,pat-001,2023-05-10T09:30:00Z,Control periódico,Dra. García\n'
                + 'visit-002,pat-001,2023-06-15T14:00:00Z,Malestar estomacal,Dr. Rodríguez\n'
                + 'visit-003,pat-002,2023-07-22T10:15:00Z,Dolor de cabeza,Dr. Martínez\n';
      } else {
        throw createApiError(`Entidad de exportación no soportada: ${exportPayload.entity}`, 400, null, 'UNSUPPORTED_ENTITY');
      }
      
      // Establecer headers para descarga
      res.setHeader('Content-Disposition', `attachment; filename=${exportPayload.entity}-export.csv`);
      res.setHeader('Content-Type', 'text/csv');
      
      res.send(csvData);
    } catch (error) {
      next(error);
    }
  });

  // Exportar reporte en formato PDF
  router.get('/pdf', async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validar tipo y id con Zod
      const params = validateQuery(ExportPdfParamsSchema, req);
      
      // Extraer contexto de la solicitud
      const requestContext = {
        userId: req.headers['x-user-id'] as string || 'anonymous',
        timestamp: new Date().toISOString()
      };
      
      logger.info(`Exportación: Generando PDF de tipo ${params.type}`, { 
        id: params.id,
        requestContext
      });
      
      // En un entorno real, aquí se generaría un PDF real
      // Para esta demostración, enviaremos un PDF simulado
      
      // Mock de datos binarios para un PDF (no es un PDF real)
      const mockPdfData = Buffer.from('JVBERi0xLjcKJeLjz9MKNSAwIG9iago8PC9GaWx0ZXIvRmxhdGVEZWNvZGUvRmlyc3QgNi9MZW5ndGggODQvTiAxL1R5cGUvT2JqU3RtPj5zdHJlYW0KeJxdjLEOgjAURXe/4m5toKGFGhLjYFwIi5NDN1NKI1JCU1ID/r0gTrjDzT33vKPY1DCZeHliYBpQA0fQDpxpxfnRCJFTdBG97DN5ig+8q3IJEKsEl5iYbOaz10jN/Ktr005uXx2OZCg63kv02U5huvgCKFoqMgplbmRzdHJlYW0KZW5kb2JqCjYgMCBvYmoKPDwvRmlsdGVyL0ZsYXRlRGVjb2RlL0ZpcnN0IDYvTGVuZ3RoIDE0OS9OIDEvVHlwZS9PYmpTdG0+PnN0cmVhbQp4nH3MMQ7CMAwF0L1foXMAjh2HCDFUYqi6MFScAKkQRG0iNQz9eyJgYPHwpqcvWVZDC4TNXyIYOqCHi2A9lKGlhU0YhLvgOT7EcXrMjzucG6xPJwE2KswkJQy2QdOLUzQN2GQ36ZwrpSI9j7Pr2VXDlmXebUm+7slk74+f8bLn2S+LzHPJjVIFKlCBkuxnnX/ZXwXXUQplbmRzdHJlYW0KZW5kb2JqCjE1IDAgb2JqCjw8L0ZpbHRlci9GbGF0ZURlY29kZS9GaXJzdCA2L0xlbmd0aCAyNC9OIDEvVHlwZS9PYmpTdG0+PnN0cmVhbQp4nDPUMwACQyFjPQtDIF0CpE2AYgDFtAXxCmVuZHN0cmVhbQplbmRvYmoKMjUgMCBvYmoKPDwvRGVjb2RlUGFybXM8PC9Db2x1bW5zIDUvUHJlZGljdG9yIDE2Pj4vRmlsdGVyL0ZsYXRlRGVjb2RlL0lEWzwwRUIxNUExNkI1QzE0QjQxOEQ4MkExMDQxQUU4MTc3RD48QzVBNEQxMEQwMUVDNDk0N0JGNEJFQzRDQURCMURBNTM+XS9JbmZvIDMzIDAgUi9MZW5ndGggNDYvUm9vdCAzNSAwIFIvU2l6ZSAzNC9UeXBlL1hSZWYvV1sxIDMgMV0+PnN0cmVhbQp4nGNiAAN+BrDQ+A8YGKBAjLEBSN79DyTAQOx/kASpZloDEGAATHsImgplbmRzdHJlYW0KZW5kb2JqCnN0YXJ0eHJlZgoxNjYKJSVFT0YK', 'base64');
      
      // Determinar el nombre del archivo basado en el tipo de reporte
      let filename = 'reporte.pdf';
      if (params.type === 'patient' && params.id) {
        filename = `paciente-${params.id}.pdf`;
      } else if (params.type === 'visit' && params.id) {
        filename = `visita-${params.id}.pdf`;
      } else if (params.type === 'summary') {
        filename = 'resumen-clinico.pdf';
      }
      
      // Establecer headers para descarga de PDF
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', mockPdfData.length);
      
      res.send(mockPdfData);
    } catch (error) {
      next(error);
    }
  });

  return router;
}; 