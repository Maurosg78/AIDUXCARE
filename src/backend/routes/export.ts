/**
 * Rutas para la exportación de datos
 */

import { Router, Request, Response, NextFunction } from 'express';
import { createApiError } from '../middleware/errorHandler';
import logger from '../utils/logger';

// Crear el router para las rutas de exportación
export const exportRoutes = (): Router => {
  const router = Router();

  // Exportar datos de pacientes (en formato JSON)
  router.get('/patients', (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info('Exportación: Generando export de pacientes');
      
      // Mock de datos para demostración
      const patients = [
        { id: 'pat-001', nombre: 'Juan Pérez', edad: 45, email: 'juan@example.com' },
        { id: 'pat-002', nombre: 'María López', edad: 38, email: 'maria@example.com' },
        { id: 'pat-003', nombre: 'Carlos Rodríguez', edad: 52, email: 'carlos@example.com' }
      ];
      
      // Establecer headers para descarga
      res.setHeader('Content-Disposition', 'attachment; filename=patients-export.json');
      res.setHeader('Content-Type', 'application/json');
      
      res.json({
        generated_at: new Date().toISOString(),
        count: patients.length,
        data: patients
      });
    } catch (error) {
      next(error);
    }
  });

  // Exportar datos de visitas (en formato JSON)
  router.get('/visits', (req: Request, res: Response, next: NextFunction) => {
    try {
      // Obtener parámetros opcionales de fecha
      const { startDate, endDate, patientId } = req.query;
      
      logger.info('Exportación: Generando export de visitas', { startDate, endDate, patientId });
      
      // Mock de datos para demostración
      const visits = [
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
      if (patientId) {
        filteredVisits = visits.filter(v => v.paciente_id === patientId);
      }
      
      // Establecer headers para descarga
      res.setHeader('Content-Disposition', 'attachment; filename=visits-export.json');
      res.setHeader('Content-Type', 'application/json');
      
      res.json({
        generated_at: new Date().toISOString(),
        filters: { startDate, endDate, patientId },
        count: filteredVisits.length,
        data: filteredVisits
      });
    } catch (error) {
      next(error);
    }
  });

  // Exportar datos en formato CSV (general)
  router.post('/csv', (req: Request, res: Response, next: NextFunction) => {
    try {
      const { entity, filters } = req.body;
      
      if (!entity) {
        throw createApiError('Se requiere especificar la entidad a exportar', 400);
      }
      
      logger.info(`Exportación: Generando export de ${entity} en formato CSV`, { filters });
      
      // Mock de datos CSV para demostración
      let csvData: string;
      
      if (entity === 'patients') {
        csvData = 'id,nombre,edad,email\n'
                + 'pat-001,Juan Pérez,45,juan@example.com\n'
                + 'pat-002,María López,38,maria@example.com\n'
                + 'pat-003,Carlos Rodríguez,52,carlos@example.com\n';
      } else if (entity === 'visits') {
        csvData = 'id,paciente_id,fecha,motivo,doctor\n'
                + 'visit-001,pat-001,2023-05-10T09:30:00Z,Control periódico,Dra. García\n'
                + 'visit-002,pat-001,2023-06-15T14:00:00Z,Malestar estomacal,Dr. Rodríguez\n'
                + 'visit-003,pat-002,2023-07-22T10:15:00Z,Dolor de cabeza,Dr. Martínez\n';
      } else {
        throw createApiError(`Entidad de exportación no soportada: ${entity}`, 400);
      }
      
      // Establecer headers para descarga
      res.setHeader('Content-Disposition', `attachment; filename=${entity}-export.csv`);
      res.setHeader('Content-Type', 'text/csv');
      
      res.send(csvData);
    } catch (error) {
      next(error);
    }
  });

  // Exportar reporte en formato PDF
  router.get('/pdf', (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type, id } = req.query;
      
      logger.info(`Exportación: Generando PDF de tipo ${type}`, { id });
      
      if (!type) {
        throw createApiError('Se requiere especificar el tipo de reporte PDF', 400);
      }
      
      // En un entorno real, aquí se generaría un PDF real
      // Para esta demostración, enviaremos un PDF simulado
      
      // Mock de datos binarios para un PDF (no es un PDF real)
      const mockPdfData = Buffer.from('JVBERi0xLjcKJeLjz9MKNSAwIG9iago8PC9GaWx0ZXIvRmxhdGVEZWNvZGUvRmlyc3QgNi9MZW5ndGggODQvTiAxL1R5cGUvT2JqU3RtPj5zdHJlYW0KeJxdjLEOgjAURXe/4m5toKGFGhLjYFwIi5NDN1NKI1JCU1ID/r0gTrjDzT33vKPY1DCZeHliYBpQA0fQDpxpxfnRCJFTdBG97DN5ig+8q3IJEKsEl5iYbOaz10jN/Ktr005uXx2OZCg63kv02U5huvgCKFoqMgplbmRzdHJlYW0KZW5kb2JqCjYgMCBvYmoKPDwvRmlsdGVyL0ZsYXRlRGVjb2RlL0ZpcnN0IDYvTGVuZ3RoIDE0OS9OIDEvVHlwZS9PYmpTdG0+PnN0cmVhbQp4nH3MMQ7CMAwF0L1foXMAjh2HCDFUYqi6MFScAKkQRG0iNQz9eyJgYPHwpqcvWVZDC4TNXyIYOqCHi2A9lKGlhU0YhLvgOT7EcXrMjzucG6xPJwE2KswkJQy2QdOLUzQN2GQ36ZwrpSI9j7Pr2VXDlmXebUm+7slk74+f8bLn2S+LzHPJjVIFKlCBkuxnnX/ZXwXXUQplbmRzdHJlYW0KZW5kb2JqCjE1IDAgb2JqCjw8L0ZpbHRlci9GbGF0ZURlY29kZS9GaXJzdCA2L0xlbmd0aCAyNC9OIDEvVHlwZS9PYmpTdG0+PnN0cmVhbQp4nDPUMwACQyFjPQtDIF0CpE2AYgDFtAXxCmVuZHN0cmVhbQplbmRvYmoKMjUgMCBvYmoKPDwvRGVjb2RlUGFybXM8PC9Db2x1bW5zIDUvUHJlZGljdG9yIDE2Pj4vRmlsdGVyL0ZsYXRlRGVjb2RlL0lEWzwwRUIxNUExNkI1QzE0QjQxOEQ4MkExMDQxQUU4MTc3RD48QzVBNEQxMEQwMUVDNDk0N0JGNEJFQzRDQURCMURBNTM+XS9JbmZvIDMzIDAgUi9MZW5ndGggNDYvUm9vdCAzNSAwIFIvU2l6ZSAzNC9UeXBlL1hSZWYvV1sxIDMgMV0+PnN0cmVhbQp4nGNiAAN+BrDQ+A8YGKBAjLEBSN79DyTAQOx/kASpZloDEGAATHsImgplbmRzdHJlYW0KZW5kb2JqCnN0YXJ0eHJlZgoxNjYKJSVFT0YK', 'base64');
      
      // Determinar el nombre del archivo basado en el tipo de reporte
      let filename = 'reporte.pdf';
      if (type === 'patient' && id) {
        filename = `paciente-${id}.pdf`;
      } else if (type === 'visit' && id) {
        filename = `visita-${id}.pdf`;
      } else if (type === 'summary') {
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