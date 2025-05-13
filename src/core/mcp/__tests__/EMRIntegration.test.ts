import { describe, it, expect, beforeAll } from 'vitest';
import { CopilotContextBuilder } from '../CopilotContextBuilder';
import { PatientService, PatientNotFoundError } from '@/core/services/patient/PatientService';
import axios from 'axios';

describe('EMR Integration Tests', () => {
  let patientService: PatientService;
  let builder: CopilotContextBuilder;

  beforeAll(() => {
    // Usar la URL base real para los tests de integración
    patientService = new PatientService('http://localhost:3000/api');
    builder = new CopilotContextBuilder(patientService);
  });

  it('debe construir contexto MCP con datos reales del EMR', async () => {
    const input = {
      patientData: {
        age: 48,
        sex: 'M' as const,
        clinicalHistory: []
      },
      formState: {
        currentInput: 'Paciente refiere dolor lumbar intenso'
      },
      professional: {
        email: 'dr.garcia@aiduxcare.com'
      },
      visit: {
        id: 'p1', // ID de paciente existente en el mock
        date: new Date(),
        type: 'Control'
      }
    };

    const context = await builder.build(input);

    // Validar estructura básica del contexto
    expect(context.user_input).toBe(input.formState.currentInput);
    expect(context.visit_metadata.visit_id).toBe(input.visit.id);

    // Validar datos enriquecidos del EMR
    expect(context.enrichment).toBeDefined();
    const enrichment = context.enrichment!;
    
    expect(enrichment.emr).toBeDefined();
    const emrData = enrichment.emr!;

    // Validar datos del paciente
    expect(emrData.patient_data).toBeDefined();
    expect(emrData.patient_data!.name).toBe('Juan García López');
    expect(emrData.patient_data!.chronicConditions).toContain('Hipertensión Arterial');

    // Validar historial de visitas
    expect(emrData.visit_history).toHaveLength(2);
    expect(emrData.visit_history[0].professional).toBe('dr.garcia@aiduxcare.com');
  });

  it('debe manejar correctamente un paciente no existente', async () => {
    const input = {
      patientData: {
        age: 35,
        sex: 'F' as const,
        clinicalHistory: []
      },
      formState: {
        currentInput: 'Primera visita'
      },
      professional: {
        email: 'dr.garcia@aiduxcare.com'
      },
      visit: {
        id: 'non-existent-id',
        date: new Date(),
        type: 'Primera Visita'
      }
    };

    const context = await builder.build(input);

    // Validar que el contexto se construye pero sin datos del EMR
    expect(context.enrichment).toBeDefined();
    const enrichment = context.enrichment!;
    
    expect(enrichment.emr).toBeDefined();
    const emrData = enrichment.emr!;

    expect(emrData.patient_data).toBeNull();
    expect(emrData.visit_history).toEqual([]);
    expect(emrData.error).toBeDefined();
  });

  it('debe validar la conexión con el servidor EMR', async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/patient/p1');
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('patient');
      expect(response.data).toHaveProperty('visits');
    } catch (error) {
      throw new Error('El servidor EMR no está disponible. Asegúrate de que esté corriendo en localhost:3000');
    }
  });
}); 