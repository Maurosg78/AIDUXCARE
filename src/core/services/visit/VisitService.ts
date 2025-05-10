import { Visit, VisitService as IVisitService } from '@/core/types';
import { supabase } from '@/core/lib/supabase';
import { trackEvent } from '@/core/lib/langfuse.client';
import { PostgrestSingleResponse } from '@supabase/supabase-js';

const TABLE_NAME = 'visits';

export class VisitNotFoundError extends Error {
  constructor(visitId: string) {
    super(`Visita con ID ${visitId} no encontrada`);
    this.name = 'VisitNotFoundError';
  }
}

/**
 * Servicio para la gestión de visitas utilizando Supabase
 * Implementa la interfaz VisitService definida en core/types
 */
export class VisitServiceImpl implements IVisitService {
  /**
   * Obtiene una visita por su ID
   */
  async getById(id: string): Promise<Visit> {
    try {
      await trackEvent('emr.get_visit', {
        visitId: id,
        action: 'query',
        operation: 'getById'
      });

      const { data, error }: PostgrestSingleResponse<Visit> = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) throw new VisitNotFoundError(id);

      return data;
    } catch (error) {
      console.error('Error obteniendo visita por ID:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las visitas
   */
  async getAll(): Promise<Visit[]> {
    try {
      await trackEvent('emr.get_all_visits', {
        action: 'query',
        operation: 'getAll'
      });

      const response = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('createdAt', { ascending: false });

      if (response.error) throw response.error;
      return response.data || [];
    } catch (error) {
      console.error('Error obteniendo todas las visitas:', error);
      throw error;
    }
  }

  /**
   * Obtiene las visitas de un paciente
   */
  async getByPatientId(patientId: string): Promise<Visit[]> {
    try {
      await trackEvent('emr.get_patient_visits', {
        patientId,
        action: 'query',
        operation: 'getByPatientId'
      });

      const response = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('patientId', patientId)
        .order('visitDate', { ascending: false });

      if (response.error) throw response.error;
      return response.data || [];
    } catch (error) {
      console.error('Error obteniendo visitas del paciente:', error);
      throw error;
    }
  }

  /**
   * Crea una nueva visita
   */
  async create(visit: Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Visit> {
    try {
      const now = new Date().toISOString();
      const newVisit = {
        ...visit,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };

      await trackEvent('emr.create_visit', {
        visitId: newVisit.id,
        patientId: newVisit.patientId,
        action: 'insert',
        operation: 'create'
      });

      const { data, error }: PostgrestSingleResponse<Visit> = await supabase
        .from(TABLE_NAME)
        .insert(newVisit)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Error al crear la visita');

      return data;
    } catch (error) {
      console.error('Error creando visita:', error);
      throw error;
    }
  }

  /**
   * Actualiza una visita existente
   */
  async update(id: string, visit: Partial<Visit>): Promise<Visit> {
    try {
      const updateData = {
        ...visit,
        updatedAt: new Date().toISOString()
      };

      await trackEvent('emr.update_visit', {
        visitId: id,
        action: 'update',
        operation: 'update'
      });

      const { data, error }: PostgrestSingleResponse<Visit> = await supabase
        .from(TABLE_NAME)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new VisitNotFoundError(id);

      return data;
    } catch (error) {
      console.error('Error actualizando visita:', error);
      throw error;
    }
  }

  /**
   * Elimina una visita por su ID
   */
  async delete(id: string): Promise<void> {
    try {
      await trackEvent('emr.delete_visit', {
        visitId: id,
        action: 'delete',
        operation: 'delete'
      });

      const { error } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error eliminando visita:', error);
      throw error;
    }
  }

  /**
   * Verifica si una visita existe
   */
  async visitExists(visitId: string): Promise<boolean> {
    try {
      const { count, error } = await supabase
        .from(TABLE_NAME)
        .select('*', { count: 'exact', head: true })
        .eq('id', visitId);

      if (error) throw error;
      return !!count && count > 0;
    } catch (error) {
      console.error('Error verificando existencia de visita:', error);
      throw error;
    }
  }

  // Métodos de compatibilidad con el código existente
  
  /**
   * Métodos de compatibilidad con nombres antiguos
   */
  async getVisitById(visitId: string): Promise<Visit> {
    return this.getById(visitId);
  }

  async getVisitsByPatientId(patientId: string): Promise<Visit[]> {
    return this.getByPatientId(patientId);
  }

  async getAllVisits(): Promise<Visit[]> {
    return this.getAll();
  }

  async createVisit(visitData: unknown): Promise<Visit> {
    return this.create(visitData as Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>);
  }

  async updateVisit(visitId: string, updateData: unknown): Promise<Visit> {
    return this.update(visitId, updateData as Partial<Visit>);
  }

  async deleteVisit(visitId: string): Promise<void> {
    return this.delete(visitId);
  }
}

// Crear una instancia del servicio
const visitService = new VisitServiceImpl();

// Exportar como default y nombrado para mantener compatibilidad
export const VisitService = visitService;
export default visitService;

// Exportar función de compatibilidad
export const visitExists = async (visitId: string): Promise<boolean> => {
  return visitService.visitExists(visitId);
};

// En desarrollo, mostrar información sobre las visitas cargadas
if (process.env.NODE_ENV === 'development') {
  // Función autoejecutable asíncrona para inicialización
  (async () => {
    try {
      console.log('\n📋 Inicializando Servicio de Visitas...');
      const visits = await VisitService.getAll().catch(err => {
        console.error('No se pudieron cargar las visitas:', err);
        return [];
      });
      
      const uniquePatients = new Set(visits.map(v => v.patientId));
      
      console.log(`✅ ${visits.length} visitas válidas cargadas`);
      console.log(`👥 ${uniquePatients.size} pacientes con historial`);
    } catch (error) {
      console.error('Error al inicializar VisitService:', error);
    }
  })();
}
