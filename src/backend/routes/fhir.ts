/**
 * Rutas para la API FHIR (Fast Healthcare Interoperability Resources)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { createApiError } from '../middleware/errorHandler';
import logger from '../utils/logger';

// Definir tipos para los recursos FHIR
type FHIRResourceType = 'Patient' | 'Observation' | 'Encounter';

// Interfaces para los recursos FHIR
interface FHIRResource {
  id: string;
  resourceType: FHIRResourceType;
  [key: string]: unknown;
}

interface FHIRPatient extends FHIRResource {
  resourceType: 'Patient';
  name?: Array<{
    family?: string;
    given?: string[];
  }>;
  gender?: string;
  birthDate?: string;
}

interface FHIRObservation extends FHIRResource {
  resourceType: 'Observation';
  status: string;
  code: {
    text: string;
  };
  subject: {
    reference: string;
  };
}

interface FHIREncounter extends FHIRResource {
  resourceType: 'Encounter';
  status: string;
  class: {
    code: string;
  };
  subject: {
    reference: string;
  };
}

// Crear el router para las rutas FHIR
export const fhirRoutes = (): Router => {
  const router = Router();

  // Obtener recursos FHIR por tipo
  router.get('/:resourceType', (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceType = req.params.resourceType as FHIRResourceType;
      
      // Mock de datos para demostración
      const mockResources: Record<FHIRResourceType, FHIRResource[]> = {
        Patient: [
          { id: 'patient-001', resourceType: 'Patient', name: [{ family: 'López', given: ['Ana'] }], gender: 'female' },
          { id: 'patient-002', resourceType: 'Patient', name: [{ family: 'Rodríguez', given: ['Carlos'] }], gender: 'male' }
        ],
        Observation: [
          { id: 'obs-001', resourceType: 'Observation', status: 'final', code: { text: 'Presión arterial' }, subject: { reference: 'Patient/patient-001' } }
        ],
        Encounter: [
          { id: 'enc-001', resourceType: 'Encounter', status: 'finished', class: { code: 'AMB' }, subject: { reference: 'Patient/patient-001' } }
        ]
      };
      
      // Verificar si el tipo de recurso solicitado es válido
      if (Object.keys(mockResources).includes(resourceType)) {
        logger.info(`FHIR: Obteniendo recursos de tipo ${resourceType}`);
        res.json({
          resourceType: 'Bundle',
          type: 'searchset',
          total: mockResources[resourceType].length,
          entry: mockResources[resourceType].map(resource => ({
            resource
          }))
        });
      } else {
        // Tipo de recurso no admitido
        throw createApiError(`Tipo de recurso FHIR no soportado: ${resourceType}`, 400);
      }
    } catch (error) {
      next(error);
    }
  });

  // Obtener un recurso FHIR específico por tipo y ID
  router.get('/:resourceType/:id', (req: Request, res: Response, next: NextFunction) => {
    try {
      const { resourceType, id } = req.params;
      logger.info(`FHIR: Buscando recurso ${resourceType}/${id}`);
      
      // Simulación de recurso encontrado (para demostración)
      if (resourceType === 'Patient' && id === 'patient-001') {
        const patient: FHIRPatient = {
          resourceType: 'Patient',
          id: 'patient-001',
          name: [{ family: 'López', given: ['Ana'] }],
          gender: 'female',
          birthDate: '1985-08-12'
        };
        res.json(patient);
      } else {
        // Recurso no encontrado
        throw createApiError(`Recurso FHIR ${resourceType}/${id} no encontrado`, 404);
      }
    } catch (error) {
      next(error);
    }
  });

  // Crear un nuevo recurso FHIR
  router.post('/:resourceType', (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceType = req.params.resourceType as FHIRResourceType;
      const resource = req.body as FHIRResource;
      
      // Verificar el tipo de recurso
      if (!resource || resource.resourceType !== resourceType) {
        throw createApiError(`El tipo de recurso en la URL y en el cuerpo deben coincidir`, 400);
      }
      
      // Generar un ID para el nuevo recurso (en un sistema real, esto lo haría la base de datos)
      const id = `${resourceType.toLowerCase()}-${Date.now()}`;
      const createdResource = {
        ...resource,
        id
      };
      
      logger.info(`FHIR: Recurso ${resourceType} creado con ID ${id}`);
      
      // Devolver el recurso creado con código 201
      res.status(201).json(createdResource);
    } catch (error) {
      next(error);
    }
  });

  return router;
}; 