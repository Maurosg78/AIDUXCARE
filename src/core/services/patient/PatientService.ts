import { Patient, PatientService as IPatientService } from '@/core/types';
import { supabase } from '@/core/lib/supabase';
import { trackEvent } from '@/core/lib/langfuse.client';
import { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';

const TABLE_NAME = 'patients';

export class PatientNotFoundError extends Error {
  constructor(patientId: string) {
    super(`Paciente con ID ${patientId} no encontrado`);
    this.name = 'PatientNotFoundError';
  }
}

/**
 * Servicio para la gestión de pacientes utilizando Supabase
 * Implementa la interfaz PatientService definida en core/types
 */
export class PatientServiceImpl implements IPatientService {
  /**
   * Obtiene un paciente por su ID
   */
  async getById(id: string): Promise<Patient> {
    try {
      await trackEvent('emr.get_patient', {
        patientId: id,
        action: 'query',
        operation: 'getById'
      });

      const { data, error }: PostgrestSingleResponse<Patient> = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) throw new PatientNotFoundError(id);

      return data;
    } catch (error) {
      console.error('Error obteniendo paciente por ID:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los pacientes
   */
  async getAll(): Promise<Patient[]> {
    try {
      await trackEvent('emr.get_all_patients', {
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
      console.error('Error obteniendo todos los pacientes:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo paciente
   */
  async create(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    try {
      const now = new Date().toISOString();
      const newPatient = {
        ...patient,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };

      await trackEvent('emr.create_patient', {
        patientId: newPatient.id,
        action: 'insert',
        operation: 'create'
      });

      const { data, error }: PostgrestSingleResponse<Patient> = await supabase
        .from(TABLE_NAME)
        .insert(newPatient)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Error al crear el paciente');

      return data;
    } catch (error) {
      console.error('Error creando paciente:', error);
      throw error;
    }
  }

  /**
   * Actualiza un paciente existente
   */
  async update(id: string, patient: Partial<Patient>): Promise<Patient> {
    try {
      const updateData = {
        ...patient,
        updatedAt: new Date().toISOString()
      };

      await trackEvent('emr.update_patient', {
        patientId: id,
        action: 'update',
        operation: 'update'
      });

      const { data, error }: PostgrestSingleResponse<Patient> = await supabase
        .from(TABLE_NAME)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new PatientNotFoundError(id);

      return data;
    } catch (error) {
      console.error('Error actualizando paciente:', error);
      throw error;
    }
  }

  /**
   * Elimina un paciente por su ID
   */
  async delete(id: string): Promise<void> {
    try {
      await trackEvent('emr.delete_patient', {
        patientId: id,
        action: 'delete',
        operation: 'delete'
      });

      const { error } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error eliminando paciente:', error);
      throw error;
    }
  }

  /**
   * Busca pacientes por nombre
   */
  async searchByName(name: string): Promise<Patient[]> {
    try {
      await trackEvent('emr.search_patients', {
        search: name,
        field: 'name',
        action: 'query',
        operation: 'searchByName'
      });

      const response = await supabase
        .from(TABLE_NAME)
        .select('*')
        .ilike('firstName', `%${name}%`);

      if (response.error) throw response.error;
      return response.data || [];
    } catch (error) {
      console.error('Error buscando pacientes por nombre:', error);
      throw error;
    }
  }

  /**
   * Busca pacientes por apellido
   */
  async searchBySurname(surname: string): Promise<Patient[]> {
    try {
      await trackEvent('emr.search_patients', {
        search: surname,
        field: 'lastName',
        action: 'query',
        operation: 'searchBySurname'
      });

      const response = await supabase
        .from(TABLE_NAME)
        .select('*')
        .ilike('lastName', `%${surname}%`);

      if (response.error) throw response.error;
      return response.data || [];
    } catch (error) {
      console.error('Error buscando pacientes por apellido:', error);
      throw error;
    }
  }

  /**
   * Verifica si un paciente existe
   */
  async patientExists(patientId: string): Promise<boolean> {
    try {
      const { count, error } = await supabase
        .from(TABLE_NAME)
        .select('*', { count: 'exact', head: true })
        .eq('id', patientId);

      if (error) throw error;
      return !!count && count > 0;
    } catch (error) {
      console.error('Error verificando existencia de paciente:', error);
      throw error;
    }
  }

  /**
   * Método para obtener un paciente por su ID (alias de getById para compatibilidad)
   */
  async getPatientById(id: string): Promise<Patient> {
    return this.getById(id);
  }

  /**
   * Método para crear un paciente (alias de create para compatibilidad)
   */
  async createPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    return this.create(patient);
  }

  /**
   * Método para actualizar un paciente (alias de update para compatibilidad)
   */
  async updatePatient(id: string, patient: Partial<Patient>): Promise<Patient> {
    return this.update(id, patient);
  }
}

// Crear una instancia del servicio
const patientService = new PatientServiceImpl();

// Exportar como default y nombrado para mantener compatibilidad
export const PatientService = patientService;
export default patientService;
