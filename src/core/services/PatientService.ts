import { Patient, PatientSchema } from '../schemas/PatientSchema';
import { trackEvent } from '../lib/langfuse.client';
import supabase from '../lib/supabaseClient';
import { Database } from '../types/supabase';

export class PatientNotFoundError extends Error {
  constructor(patientId: string) {
    super(`Paciente con ID ${patientId} no encontrado`);
    this.name = 'PatientNotFoundError';
  }
}

export class PatientService {
  /**
   * Obtiene los datos completos de un paciente
   */
  async getPatientById(patientId: string): Promise<Patient> {
    try {
      await trackEvent('emr.get_patient_data', {
        patient_id: patientId,
        timestamp: new Date().toISOString()
      });

      const { data: patient, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (error) {
        throw error;
      }

      if (!patient) {
        throw new PatientNotFoundError(patientId);
      }

      return PatientSchema.parse(patient);
    } catch (error) {
      console.error('Error al obtener datos del paciente:', error);
      throw error;
    }
  }

  /**
   * Obtiene información básica del paciente
   */
  async getPatientBasicInfo(patientId: string): Promise<Pick<Patient, 'id' | 'full_name' | 'birth_date' | 'sex'>> {
    const { data: patient, error } = await supabase
      .from('patients')
      .select('id, full_name, birth_date, sex')
      .eq('id', patientId)
      .single();

    if (error) {
      throw error;
    }

    if (!patient) {
      throw new PatientNotFoundError(patientId);
    }

    return patient;
  }

  /**
   * Obtiene el historial clínico de un paciente
   */
  async getPatientHistory(patientId: string): Promise<string[]> {
    const { data: patient, error } = await supabase
      .from('patients')
      .select('clinical_history')
      .eq('id', patientId)
      .single();

    if (error) {
      throw error;
    }

    if (!patient) {
      throw new PatientNotFoundError(patientId);
    }

    return Array.isArray(patient.clinical_history) 
      ? patient.clinical_history 
      : [patient.clinical_history];
  }

  /**
   * Crea un nuevo paciente
   */
  async createPatient(patientData: Database['public']['Tables']['patients']['Insert']): Promise<Patient> {
    try {
      await trackEvent('emr.create_patient', {
        timestamp: new Date().toISOString()
      });

      const { data: patient, error } = await supabase
        .from('patients')
        .insert([patientData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return PatientSchema.parse(patient);
    } catch (error) {
      console.error('Error al crear paciente:', error);
      throw error;
    }
  }

  /**
   * Actualiza los datos de un paciente
   */
  async updatePatient(
    patientId: string, 
    updateData: Database['public']['Tables']['patients']['Update']
  ): Promise<Patient> {
    try {
      await trackEvent('emr.update_patient', {
        patient_id: patientId,
        timestamp: new Date().toISOString()
      });

      const { data: patient, error } = await supabase
        .from('patients')
        .update(updateData)
        .eq('id', patientId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!patient) {
        throw new PatientNotFoundError(patientId);
      }

      return PatientSchema.parse(patient);
    } catch (error) {
      console.error('Error al actualizar paciente:', error);
      throw error;
    }
  }

  /**
   * Elimina un paciente
   */
  async deletePatient(patientId: string): Promise<void> {
    try {
      await trackEvent('emr.delete_patient', {
        patient_id: patientId,
        timestamp: new Date().toISOString()
      });

      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error al eliminar paciente:', error);
      throw error;
    }
  }
} 