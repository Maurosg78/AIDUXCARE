import { Visit, VisitSchema } from '../schemas/VisitSchema';
import { v4 as uuidv4 } from 'uuid';

/**
 * Store en memoria para visitas
 * Proporciona una capa de persistencia temporal para desarrollo
 */
export let visits: Visit[] = [];

/**
 * Obtiene una visita por su ID
 */
export const getVisitById = (id: string): Visit | undefined => {
  return visits.find(v => v.id === id);
};

/**
 * Obtiene todas las visitas de un paciente
 */
export const getVisitsByPatientId = (patientId: string): Visit[] => {
  return visits.filter(v => v.patient_id === patientId);
};

/**
 * Obtiene todas las visitas
 */
export const getAllVisits = (): Visit[] => {
  return [...visits];
};

/**
 * Agrega una nueva visita
 */
export const addVisit = (visitData: Omit<Visit, 'id'>): Visit => {
  const newVisit: Visit = {
    id: uuidv4(),
    ...visitData
  };

  // Validar datos con el schema
  const validatedVisit = VisitSchema.parse(newVisit);
  visits.push(validatedVisit);
  
  // Log en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.log(`📝 Nueva visita creada: ${validatedVisit.id}`);
  }
  
  return validatedVisit;
};

/**
 * Actualiza una visita existente
 */
export const updateVisit = (id: string, updatedFields: Partial<Omit<Visit, 'id'>>): Visit | undefined => {
  const index = visits.findIndex(v => v.id === id);
  if (index === -1) return undefined;

  const updatedVisit: Visit = {
    ...visits[index],
    ...updatedFields
  };

  // Validar datos actualizados
  const validatedVisit = VisitSchema.parse(updatedVisit);
  visits[index] = validatedVisit;

  // Log en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.log(`✏️ Visita actualizada: ${validatedVisit.id}`);
  }

  return validatedVisit;
};

/**
 * Elimina una visita por su ID
 */
export const deleteVisit = (id: string): boolean => {
  const initialLength = visits.length;
  visits = visits.filter(v => v.id !== id);
  
  const deleted = visits.length !== initialLength;
  
  // Log en desarrollo
  if (process.env.NODE_ENV === 'development' && deleted) {
    console.log(`🗑️ Visita eliminada: ${id}`);
  }
  
  return deleted;
};

/**
 * Verifica si existe una visita
 */
export const visitExists = (id: string): boolean => {
  return visits.some(v => v.id === id);
};

/**
 * Inicializa el store con datos de seed
 */
export const initializeStore = (seedData: Visit[]): void => {
  visits = [...seedData];
  
  // Log en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.log(`\n📚 Store de visitas inicializado con ${visits.length} visitas`);
    console.log('🔑 IDs de visitas disponibles:');
    visits.forEach((visit, index) => {
      console.log(`${index + 1}. ${visit.id} - ${visit.reason}`);
    });
    console.log('\n');
  }
}; 