/**
 * Rutas para la API FHIR (Fast Healthcare Interoperability Resources)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { createApiError, createNotFoundError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';
import { z, validateParams, validateBody, FHIRPatientSchema } from '../utils/zod-utils.js';
import { AdaptedFHIRPatient } from '@/types/backend-adapters.js';

// Definir tipos para los recursos FHIR
export type FHIRResourceType = 'Patient' | 'Observation' | 'Encounter';

// Esquema para validar tipo de recurso
const ResourceTypeSchema = z.object({
  resourceType: z.enum(['Patient', 'Observation', 'Encounter'])
});

// Esquema para validar parámetros de recursos
const ResourceParamsSchema = z.object({
  resourceType: z.enum(['Patient', 'Observation', 'Encounter']),
  id: z.string().optional()
});

// Interfaces para los recursos FHIR
export interface FHIRResource {
  id: string;
  resourceType: FHIRResourceType;
  [key: string]: unknown;
}

export interface FHIRObservation extends FHIRResource {
  resourceType: 'Observation';
  status: string;
  code: {
    text: string;
  };
  subject: {
    reference: string;
  };
}

export interface FHIREncounter extends FHIRResource {
  resourceType: 'Encounter';
  status: string;
  class: {
    code: string;
  };
  subject: {
    reference: string;
  };
}

// Tipo para respuesta de búsqueda FHIR
export interface FHIRBundle<T extends FHIRResource> {
  resourceType: 'Bundle';
  type: 'searchset';
  total: number;
  entry: Array<{
    resource: T;
  }>;
}

// Crear el router para las rutas FHIR
export const fhirRoutes = (): Router => {
  const router = Router();

  // Obtener recursos FHIR por tipo
  router.get('/:resourceType', (req: Request, res: Response, next: NextFunction) => {
    try {
      const { resourceType } = validateParams(ResourceParamsSchema, req);
      
      // Mock de datos para demostración
      const mockResources: Record<FHIRResourceType, FHIRResource[]> = {
        Patient: [
          { 
            id: 'patient-001', 
            resourceType: 'Patient', 
            name: [{ family: 'López', given: ['Ana'] }], 
            gender: 'female' 
          } as AdaptedFHIRPatient,
          { 
            id: 'patient-002', 
            resourceType: 'Patient', 
            name: [{ family: 'Rodríguez', given: ['Carlos'] }], 
            gender: 'male' 
          } as AdaptedFHIRPatient
        ],
        Observation: [
          { 
            id: 'obs-001', 
            resourceType: 'Observation', 
            status: 'final', 
            code: { text: 'Presión arterial' }, 
            subject: { reference: 'Patient/patient-001' } 
          } as FHIRObservation
        ],
        Encounter: [
          { 
            id: 'enc-001', 
            resourceType: 'Encounter', 
            status: 'finished', 
            class: { code: 'AMB' }, 
            subject: { reference: 'Patient/patient-001' } 
          } as FHIREncounter
        ]
      };
      
      // Verificar si el tipo de recurso solicitado es válido
      logger.info(`FHIR: Obteniendo recursos de tipo ${resourceType}`);
      
      const resources = mockResources[resourceType as FHIRResourceType];
      
      const bundle: FHIRBundle<FHIRResource> = {
        resourceType: 'Bundle',
        type: 'searchset',
        total: resources.length,
        entry: resources.map(resource => ({
          resource
        }))
      };
      
      res.json(bundle);
    } catch (error) {
      next(error);
    }
  });

  // Obtener un recurso FHIR específico por tipo y ID
  router.get('/:resourceType/:id', (req: Request, res: Response, next: NextFunction) => {
    try {
      const { resourceType, id } = validateParams(ResourceParamsSchema, req);
      logger.info(`FHIR: Buscando recurso ${resourceType}/${id}`);
      
      // Simulación de recurso encontrado (para demostración)
      if (resourceType === 'Patient' && id === 'patient-001') {
        const patient: AdaptedFHIRPatient = {
          resourceType: 'Patient',
          id: 'patient-001',
          name: [{ family: 'López', given: ['Ana'] }],
          gender: 'female',
          birthDate: '1985-08-12'
        };
        res.json(patient);
      } else {
        // Recurso no encontrado
        throw createNotFoundError(`Recurso FHIR ${resourceType}/${id} no encontrado`, id);
      }
    } catch (error) {
      next(error);
    }
  });

  // Crear un nuevo recurso FHIR
  router.post('/:resourceType', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { resourceType } = validateParams(ResourceParamsSchema, req);
      
      // Validar que el cuerpo sea un recurso FHIR válido
      // En un caso real, validaríamos con esquemas específicos dependiendo del tipo
      if (resourceType === 'Patient') {
        validateBody(FHIRPatientSchema, req);
      } else {
        // Validación genérica para otros tipos
        validateBody(ResourceTypeSchema, req);
      }
      
      const resource = req.body as FHIRResource;
      
      // Verificar el tipo de recurso
      if (resource.resourceType !== resourceType) {
        throw createApiError(
          `El tipo de recurso en la URL (${resourceType}) y en el cuerpo (${resource.resourceType}) deben coincidir`, 
          400,
          undefined,
          'RESOURCE_TYPE_MISMATCH',
          'ValidationError'
        );
      }
      
      // Generar un ID para el nuevo recurso (en un sistema real, esto lo haría la base de datos)
      const id = `${resourceType.toLowerCase()}-${Date.now()}`;
      const createdResource: FHIRResource = {
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