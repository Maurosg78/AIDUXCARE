import { Visit, VisitSchema } from '@/core/schemas/VisitSchema';
import { trackEvent } from '@/core/lib/langfuse.client';
import supabase from '@/core/lib/supabaseClient';
import { Database } from '../types/supabase';
import { v4 as uuidv4 } from 'uuid';

// Datos mock de emergencia para usar en desarrollo cuando falla la conexión a Supabase
const MOCK_VISITS: Visit[] = [
  {
    id: '1',
    patient_id: '101',
    professional_id: 'prof-1',
    date: new Date().toISOString(),
    reason: 'Evaluación kinésica inicial',
    notes: 'Paciente con dolor lumbar de 2 semanas de evolución',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    patient_id: '102',
    professional_id: 'prof-1',
    date: new Date(Date.now() - 86400000).toISOString(),  // Ayer
    reason: 'Control mensual',
    notes: 'Progreso favorable en rehabilitación post cirugía',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '3',
    patient_id: '101',
    professional_id: 'prof-1',
    date: new Date(Date.now() - 172800000).toISOString(),  // Hace 2 días
    reason: 'Sesión de terapia',
    notes: 'Se aplican ejercicios de movilidad y fortalecimiento',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString()
  }
];

export class VisitNotFoundError extends Error {
  constructor(visitId: string) {
    super(`Visita con ID ${visitId} no encontrada`);
    this.name = 'VisitNotFoundError';
  }
}

// Función para detectar si debemos usar datos mock
const shouldUseMockData = (error: any): boolean => {
  // Solo usar datos mock en desarrollo
  if (process.env.NODE_ENV !== 'development') return false;
  
  // Si es un error de cabeceras, usar datos mock
  if (error?.message?.includes('Headers')) return true;
  
  // Si es un error de conexión o autenticación, usar datos mock
  if (error?.code === 'PGRST301' || error?.code === 'PGRST401') return true;
  
  return false;
};

export class VisitService {
  private static handleSupabaseError(operation: string, error: any): never {
    console.error(`Error en ${operation}:`, error);
    if (error.message && error.message.includes('Headers')) {
      console.error('Error de Headers detectado. Verificar la clave anónima de Supabase.');
    }
    throw error;
  }

  /**
   * Verifica si existe una visita
   */
  static async visitExists(visitId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('visits')
        .select('id')
        .eq('id', visitId)
        .single();

      if (error) {
        console.error('Error al verificar visita:', error);
        // Si estamos en desarrollo y podemos usar datos mock
        if (shouldUseMockData(error)) {
          console.warn('⚠️ Usando datos mock para visitExists');
          return MOCK_VISITS.some(v => v.id === visitId);
        }
        return false;
      }

      const exists = !!data;
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 Verificando visita ${visitId}: ${exists ? '✅' : '❌'}`);
      }
      return exists;
    } catch (error) {
      console.error('Error al verificar visita:', error);
      return false;
    }
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
        // Si estamos en desarrollo y podemos usar datos mock
        if (shouldUseMockData(error)) {
          console.warn('⚠️ Usando datos mock para getVisitById');
          const mockVisit = MOCK_VISITS.find(v => v.id === visitId);
          if (mockVisit) return mockVisit;
        }
        return this.handleSupabaseError('obtener visita', error);
      }

      if (!visit) {
        throw new VisitNotFoundError(visitId);
      }

      return VisitSchema.parse(visit);
    } catch (error) {
      // Último intento con datos mock si es apropiado
      if (error instanceof Error && shouldUseMockData(error)) {
        console.warn('⚠️ Usando datos mock para getVisitById (último recurso)');
        const mockVisit = MOCK_VISITS.find(v => v.id === visitId);
        if (mockVisit) return mockVisit;
      }
      return this.handleSupabaseError('obtener visita', error);
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
        // Si estamos en desarrollo y podemos usar datos mock
        if (shouldUseMockData(error)) {
          console.warn('⚠️ Usando datos mock para getVisitsByPatientId');
          return MOCK_VISITS.filter(v => v.patient_id === patientId);
        }
        return this.handleSupabaseError('obtener visitas del paciente', error);
      }

      return visits.map(visit => VisitSchema.parse(visit));
    } catch (error) {
      // Último intento con datos mock si es apropiado
      if (error instanceof Error && shouldUseMockData(error)) {
        console.warn('⚠️ Usando datos mock para getVisitsByPatientId (último recurso)');
        return MOCK_VISITS.filter(v => v.patient_id === patientId);
      }
      return this.handleSupabaseError('obtener visitas del paciente', error);
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
        // Si estamos en desarrollo y podemos usar datos mock
        if (shouldUseMockData(error)) {
          console.warn('⚠️ Usando datos mock para getAllVisits');
          return [...MOCK_VISITS];
        }
        return this.handleSupabaseError('obtener todas las visitas', error);
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`📊 Total de visitas: ${visits.length}`);
        visits.forEach((visit, index) => {
          console.log(`${index + 1}. ${visit.id} - ${visit.reason}`);
        });
      }

      return visits.map(visit => VisitSchema.parse(visit));
    } catch (error) {
      // Último intento con datos mock si es apropiado
      if (error instanceof Error && shouldUseMockData(error)) {
        console.warn('⚠️ Usando datos mock para getAllVisits (último recurso)');
        return [...MOCK_VISITS];
      }
      return this.handleSupabaseError('obtener todas las visitas', error);
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
        // Si estamos en desarrollo y podemos usar datos mock
        if (shouldUseMockData(error)) {
          console.warn('⚠️ Usando datos mock para createVisit');
          const mockVisit: Visit = {
            id: uuidv4(),
            ...visitData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          MOCK_VISITS.push(mockVisit);
          return mockVisit;
        }
        return this.handleSupabaseError('crear visita', error);
      }

      return VisitSchema.parse(visit);
    } catch (error) {
      return this.handleSupabaseError('crear visita', error);
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
        return this.handleSupabaseError('actualizar visita', error);
      }

      if (!visit) {
        throw new VisitNotFoundError(visitId);
      }

      return VisitSchema.parse(visit);
    } catch (error) {
      return this.handleSupabaseError('actualizar visita', error);
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
        this.handleSupabaseError('eliminar visita', error);
      }
    } catch (error) {
      this.handleSupabaseError('eliminar visita', error);
    }
  }
}

// En desarrollo, mostrar información sobre las visitas cargadas
if (process.env.NODE_ENV === 'development') {
  // Función autoejecutable asíncrona para inicialización
  (async () => {
    try {
      console.log('\n📋 Inicializando Servicio de Visitas...');
      const visits = await VisitService.getAllVisits().catch(err => {
        console.error('No se pudieron cargar las visitas:', err);
        return [];
      });
      
      const uniquePatients = new Set(visits.map(v => v.patient_id));
      
      console.log(`✅ ${visits.length} visitas válidas cargadas`);
      console.log(`👥 ${uniquePatients.size} pacientes con historial`);
    } catch (error) {
      console.error('Error al inicializar VisitService:', error);
    }
  })();
} 

export default VisitService;
