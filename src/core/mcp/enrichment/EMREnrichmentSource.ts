import { EnrichmentSource } from '../ContextEnricher';
import { MCPContext } from '../interfaces/MCPTool';
import type { PatientService as IPatientService  } from '@/core/types';

export class EMREnrichmentSource implements EnrichmentSource {
  name = 'emr';
  private patientService: IPatientService;

  constructor(patientService: IPatientService) {
    this.patientService = patientService;
  }

  async getEnrichmentData(context: MCPContext): Promise<Record<string, unknown>> {
    try {
      const patientId = context.visit_metadata?.visit_id || '';
      
      // Verificamos que el ID del paciente exista
      if (!patientId) {
        throw new Error('ID de paciente no proporcionado');
      }
      
      const patientExists = await this.patientService.patientExists(patientId);
      
      if (!patientExists) {
        return {
          error: 'Paciente no encontrado',
          enriched_at: new Date().toISOString()
        };
      }
      
      const patientData = await this.patientService.getById(patientId);
      // Aquí normalmente obtendríamos el historial de visitas, pero por simplicidad
      // solo usamos los datos del paciente
      
      return {
        patient_data: patientData,
        visit_history: [],
        enriched_at: new Date().toISOString()
      };
    } catch (error) {
      console.warn('Error al enriquecer con datos EMR:', error);
      return {
        patient_data: null,
        visit_history: [],
        enriched_at: new Date().toISOString(),
        error: 'No se pudieron obtener datos del EMR'
      };
    }
  }
} 