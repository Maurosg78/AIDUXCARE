/**
 * Configuración central de todas las rutas del backend
 */

import { Express } from 'express';
import { fhirRoutes } from './fhir.js';
import { mcpRoutes } from './mcp.js';
import { exportRoutes } from './export.js';
import { notFoundHandler } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

/**
 * Configura todas las rutas de la aplicación
 * @param app Instancia de Express
 */
export const setupRoutes = (app: Express): void => {
  // Configurar rutas principales
  app.use('/api/fhir', fhirRoutes());
  app.use('/api/mcp', mcpRoutes());
  app.use('/api/export', exportRoutes());
  
  // Ruta básica para verificar que el servidor está funcionando
  app.get('/', (_req, res) => {
    res.json({
      status: 'online',
      version: process.env.npm_package_version || '1.0.0',
      endpoints: {
        fhir: '/api/fhir',
        mcp: '/api/mcp',
        export: '/api/export'
      }
    });
  });
  
  // Manejar rutas no encontradas (404)
  app.use(notFoundHandler);
  
  logger.info('✅ Rutas configuradas correctamente');
}; 