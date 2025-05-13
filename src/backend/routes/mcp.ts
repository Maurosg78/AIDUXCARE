/**
 * Rutas para el Medical Control Panel (MCP)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { createNotFoundError } from '../middleware/errorHandler';
import logger from '../utils/logger';
import { 
  z, 
  validateBody, 
  validateParams, 
  VisitSchema, 
  ContextSchema,
  type Patient,
  type Visit,
  type Context
} from '../utils/zod-utils';

// Tipo para la respuesta exitosa
interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

// Esquema para identificador de paciente
const PatientIdSchema = z.object({
  id: z.string()
});

// Esquema para crear visita
const CreateVisitSchema = VisitSchema.omit({ id: true, created_at: true, updated_at: true });

// Crear el router para las rutas MCP
export const mcpRoutes = (): Router => {
  const router = Router();

  // Obtener lista de pacientes
  router.get('/patients', (_req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info('MCP: Obteniendo lista de pacientes');
      
      // Mock de datos para demostración
      const patients: Patient[] = [
        { id: 'pat-001', nombre: 'Juan Pérez', edad: 45, email: 'juan@example.com' },
        { id: 'pat-002', nombre: 'María López', edad: 38, email: 'maria@example.com' },
        { id: 'pat-003', nombre: 'Carlos Rodríguez', edad: 52, email: 'carlos@example.com' }
      ];
      
      const response: SuccessResponse<Patient[]> = {
        success: true,
        data: patients
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  });

  // Obtener un paciente específico por ID
  router.get('/patients/:id', (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validar parámetros
      const { id } = validateParams(PatientIdSchema, req);
      logger.info(`MCP: Buscando paciente con ID ${id}`);
      
      // Mock de búsqueda de paciente
      const patient: Patient = { 
        id: 'pat-001', 
        nombre: 'Juan Pérez', 
        edad: 45, 
        email: 'juan@example.com' 
      };
      
      if (id === 'pat-001') {
        const response: SuccessResponse<Patient> = {
          success: true,
          data: patient
        };
        res.json(response);
      } else {
        throw createNotFoundError(`Paciente con ID ${id} no encontrado`, id);
      }
    } catch (error) {
      next(error);
    }
  });

  // Obtener historial de visitas de un paciente
  router.get('/patients/:id/visits', (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validar parámetros
      const { id } = validateParams(PatientIdSchema, req);
      logger.info(`MCP: Obteniendo historial de visitas para paciente ${id}`);
      
      // Mock de datos de visitas
      const visits: Visit[] = [
        { 
          id: 'visit-001', 
          paciente_id: id, 
          fecha: '2023-05-10T09:30:00Z', 
          motivo: 'Control periódico',
          doctor: 'Dra. García'
        },
        { 
          id: 'visit-002', 
          paciente_id: id, 
          fecha: '2023-06-15T14:00:00Z', 
          motivo: 'Malestar estomacal',
          doctor: 'Dr. Rodríguez'
        }
      ];
      
      const response: SuccessResponse<Visit[]> = {
        success: true,
        data: visits
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  });

  // Crear una nueva visita para un paciente
  router.post('/patients/:id/visits', (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validar parámetros y cuerpo
      const { id } = validateParams(PatientIdSchema, req);
      const visitData = validateBody(CreateVisitSchema, req);
      
      // Generar ID para la nueva visita
      const visitId = `visit-${Date.now()}`;
      const newVisit: Visit = {
        id: visitId,
        paciente_id: id,
        ...visitData,
        created_at: new Date().toISOString()
      };
      
      logger.info(`MCP: Nueva visita creada para paciente ${id} con ID ${visitId}`);
      
      const response: SuccessResponse<Visit> = {
        success: true,
        data: newVisit,
        message: 'Visita creada correctamente'
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  });

  // Obtener registro de auditoría de visita
  router.get('/visits/:id/audit-log', (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validar parámetros
      const { id } = validateParams(PatientIdSchema, req);
      logger.info(`MCP: Obteniendo registro de auditoría para la visita ${id}`);
      
      // Definir tipo para registros de auditoría
      interface AuditLogEntry {
        id: string;
        visit_id: string;
        timestamp: string;
        action: string;
        field: string;
        old_value: string | null;
        new_value: string;
        modified_by: string;
        source: string;
      }
      
      // Mock de datos de auditoría
      const auditLog: AuditLogEntry[] = [
        {
          id: `log-001`,
          visit_id: id,
          timestamp: '2023-06-15T14:05:23Z',
          action: 'field_updated',
          field: 'motivo',
          old_value: 'Consulta inicial',
          new_value: 'Dolor de cabeza',
          modified_by: 'doctor@example.com',
          source: 'user'
        },
        {
          id: `log-002`,
          visit_id: id,
          timestamp: '2023-06-15T14:08:45Z',
          action: 'field_updated',
          field: 'diagnóstico',
          old_value: null,
          new_value: 'Migraña',
          modified_by: 'doctor@example.com',
          source: 'user'
        }
      ];
      
      const response: SuccessResponse<AuditLogEntry[]> = {
        success: true,
        data: auditLog
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  });

  // Obtener información de contexto del MCP
  router.get('/context', (_req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info('MCP: Obteniendo información de contexto');
      
      // Mock de datos de contexto del MCP
      const contextData: Context = {
        instalacion: 'Hospital Central',
        version: '2.5.1',
        modulos_activos: ['pacientes', 'visitas', 'reportes', 'administracion'],
        configuracion: {
          idioma_defecto: 'es',
          tema: 'light',
          timeout_sesion: 30 // minutos
        },
        estadisticas: {
          pacientes_activos: 1245,
          visitas_hoy: 78,
          visitas_pendientes: 22
        }
      };
      
      const response: SuccessResponse<Context> = {
        success: true,
        data: contextData
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  });

  // Actualizar información de contexto del MCP
  router.post('/context', (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validar el cuerpo de la solicitud
      const contextData = validateBody(ContextSchema, req);
      logger.info('MCP: Actualizando información de contexto');
      
      // Simulación de actualización exitosa
      const response: SuccessResponse<Context> = {
        success: true,
        data: {
          ...contextData,
          version: contextData.version // Incrementar versión en un caso real
        },
        message: 'Contexto actualizado correctamente'
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  });

  return router;
}; 