/**
 * Rutas para el Medical Control Panel (MCP)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { createApiError } from '../middleware/errorHandler';
import logger from '../utils/logger';

// Crear el router para las rutas MCP
export const mcpRoutes = (): Router => {
  const router = Router();

  // Obtener lista de pacientes
  router.get('/patients', (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info('MCP: Obteniendo lista de pacientes');
      
      // Mock de datos para demostración
      const patients = [
        { id: 'pat-001', nombre: 'Juan Pérez', edad: 45, email: 'juan@example.com' },
        { id: 'pat-002', nombre: 'María López', edad: 38, email: 'maria@example.com' },
        { id: 'pat-003', nombre: 'Carlos Rodríguez', edad: 52, email: 'carlos@example.com' }
      ];
      
      res.json({ success: true, data: patients });
    } catch (error) {
      next(error);
    }
  });

  // Obtener un paciente específico por ID
  router.get('/patients/:id', (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      logger.info(`MCP: Buscando paciente con ID ${id}`);
      
      // Mock de búsqueda de paciente
      const patient = { id: 'pat-001', nombre: 'Juan Pérez', edad: 45, email: 'juan@example.com' };
      
      if (id === 'pat-001') {
        res.json({ success: true, data: patient });
      } else {
        throw createApiError(`Paciente con ID ${id} no encontrado`, 404);
      }
    } catch (error) {
      next(error);
    }
  });

  // Obtener historial de visitas de un paciente
  router.get('/patients/:id/visits', (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      logger.info(`MCP: Obteniendo historial de visitas para paciente ${id}`);
      
      // Mock de datos de visitas
      const visits = [
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
      
      res.json({ success: true, data: visits });
    } catch (error) {
      next(error);
    }
  });

  // Crear una nueva visita para un paciente
  router.post('/patients/:id/visits', (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const visitData = req.body;
      
      if (!visitData || !visitData.motivo || !visitData.fecha || !visitData.doctor) {
        throw createApiError('Datos de visita incompletos. Se requiere motivo, fecha y doctor', 400);
      }
      
      // Generar ID para la nueva visita
      const visitId = `visit-${Date.now()}`;
      const newVisit = {
        id: visitId,
        paciente_id: id,
        ...visitData,
        created_at: new Date().toISOString()
      };
      
      logger.info(`MCP: Nueva visita creada para paciente ${id} con ID ${visitId}`);
      
      res.status(201).json({ success: true, data: newVisit });
    } catch (error) {
      next(error);
    }
  });

  // Obtener registro de auditoría de visita
  router.get('/visits/:id/audit-log', (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      logger.info(`MCP: Obteniendo registro de auditoría para la visita ${id}`);
      
      // Mock de datos de auditoría
      const auditLog = [
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
      
      res.json({ success: true, data: auditLog });
    } catch (error) {
      next(error);
    }
  });

  // Obtener información de contexto del MCP
  router.get('/context', (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info('MCP: Obteniendo información de contexto');
      
      // Mock de datos de contexto del MCP
      const contextData = {
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
      
      res.json({ success: true, data: contextData });
    } catch (error) {
      next(error);
    }
  });

  // Actualizar información de contexto del MCP
  router.post('/context', (req: Request, res: Response, next: NextFunction) => {
    try {
      const contextData = req.body;
      logger.info('MCP: Actualizando información de contexto', contextData);
      
      if (!contextData) {
        throw createApiError('Se requiere información de contexto para actualizar', 400);
      }
      
      // Simulación de actualización exitosa
      res.status(200).json({
        success: true,
        message: 'Contexto actualizado correctamente',
        data: {
          ...contextData,
          updated_at: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}; 