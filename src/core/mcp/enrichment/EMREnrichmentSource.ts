import { EnrichmentSource } from '../ContextEnricher';
import { MCPContext } from '../schemas';
import { PatientService } from '../../services/PatientService';

export class EMREnrichmentSource implements EnrichmentSource {
  name = 'emr';
  private patientService: PatientService;

  constructor(patientService: PatientService) {
    this.patientService = patientService;
  }

  async getEnrichmentData(context: MCPContext): Promise<Record<string, unknown>> {
    try {
      const patientId = context.visit_metadata.visit_id;
      const [patientData, visitHistory] = await Promise.all([
        this.patientService.getPatientData(patientId),
        this.patientService.getVisitHistory(patientId)
      ]);

      return {
        patient_data: patientData,
        visit_history: visitHistory || [],
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