import { Visit, VisitSchema } from '../schemas/VisitSchema';
import { trackEvent } from '../lib/langfuse.client';
import supabase from '../lib/supabaseClient';
import { Database } from '../types/supabase';

export class VisitNotFoundError extends Error {
  constructor(visitId: string) {
    super(`Visita con ID ${visitId} no encontrada`);
    this.name = 'VisitNotFoundError';
  }
}

export class VisitService {
  /**
   * Verifica si existe una visita
   */
  static async visitExists(visitId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('visits')
      .select('id')
      .eq('id', visitId)
      .single();

    if (error) {
      console.error('Error al verificar visita:', error);
      return false;
    }

    const exists = !!data;
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 Verificando visita ${visitId}: ${exists ? '✅' : '❌'}`);
    }
    return exists;
  }

  /**
   * Obtiene una visita por su ID
   */
  static async getVisitById(visitId: string): Promise<Visit> {
    try {
      await trackEvent('emr.get_visit', {
        visit_id: visitId,
        timestamp: new Date().toISOString()
      });

      const { data: visit, error } = await supabase
        .from('visits')
        .select('*')
        .eq('id', visitId)
        .single();

      if (error) {
        throw error;
      }

      if (!visit) {
        throw new VisitNotFoundError(visitId);
      }

      return VisitSchema.parse(visit);
    } catch (error) {
      console.error('Error al obtener visita:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las visitas de un paciente
   */
  static async getVisitsByPatientId(patientId: string): Promise<Visit[]> {
    try {
      await trackEvent('emr.get_patient_visits', {
        patient_id: patientId,
        timestamp: new Date().toISOString()
      });

      const { data: visits, error } = await supabase
        .from('visits')
        .select('*')
        .eq('patient_id', patientId)
        .order('date', { ascending: false });

      if (error) {
        throw error;
      }

      return visits.map(visit => VisitSchema.parse(visit));
    } catch (error) {
      console.error('Error al obtener visitas del paciente:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las visitas
   */
  static async getAllVisits(): Promise<Visit[]> {
    try {
      await trackEvent('emr.get_all_visits', {
        timestamp: new Date().toISOString()
      });

      const { data: visits, error } = await supabase
        .from('visits')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        throw error;
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`📊 Total de visitas: ${visits.length}`);
        visits.forEach((visit, index) => {
          console.log(`${index + 1}. ${visit.id} - ${visit.reason}`);
        });
      }

      return visits.map(visit => VisitSchema.parse(visit));
    } catch (error) {
      console.error('Error al obtener todas las visitas:', error);
      throw error;
    }
  }

  /**
   * Crea una nueva visita
   */
  static async createVisit(visitData: Database['public']['Tables']['visits']['Insert']): Promise<Visit> {
    try {
      await trackEvent('emr.create_visit', {
        patient_id: visitData.patient_id,
        timestamp: new Date().toISOString()
      });

      const { data: visit, error } = await supabase
        .from('visits')
        .insert([visitData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return VisitSchema.parse(visit);
    } catch (error) {
      console.error('Error al crear visita:', error);
      throw error;
    }
  }

  /**
   * Actualiza una visita existente
   */
  static async updateVisit(
    visitId: string, 
    updateData: Database['public']['Tables']['visits']['Update']
  ): Promise<Visit> {
    try {
      await trackEvent('emr.update_visit', {
        visit_id: visitId,
        timestamp: new Date().toISOString()
      });

      const { data: visit, error } = await supabase
        .from('visits')
        .update(updateData)
        .eq('id', visitId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!visit) {
        throw new VisitNotFoundError(visitId);
      }

      return VisitSchema.parse(visit);
    } catch (error) {
      console.error('Error al actualizar visita:', error);
      throw error;
    }
  }

  /**
   * Elimina una visita
   */
  static async deleteVisit(visitId: string): Promise<void> {
    try {
      await trackEvent('emr.delete_visit', {
        visit_id: visitId,
        timestamp: new Date().toISOString()
      });

      const { error } = await supabase
        .from('visits')
        .delete()
        .eq('id', visitId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error al eliminar visita:', error);
      throw error;
    }
  }
}

// En desarrollo, mostrar información sobre las visitas cargadas
if (process.env.NODE_ENV === 'development') {
  // Función autoejecutable asíncrona para inicialización
  (async () => {
    try {
      const visits = await VisitService.getAllVisits();
      const uniquePatients = new Set(visits.map(v => v.patient_id));
      
      console.log('\n📋 Servicio de Visitas:');
      console.log(`✅ ${visits.length} visitas válidas cargadas`);
      console.log(`👥 ${uniquePatients.size} pacientes con historial`);
    } catch (error) {
      console.error('Error al inicializar VisitService:', error);
    }
  })();
} 