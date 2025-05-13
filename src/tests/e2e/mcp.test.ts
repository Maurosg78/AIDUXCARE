import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { CopilotContextBuilder } from '../../core/mcp/CopilotContextBuilder';
import { PatientService } from '../../core/services/PatientService';
import { trackEvent } from '../../core/lib/langfuse.client';
import { visitsSeed } from '../../core/data/seed/realVisitsSeed';
import * as visitStore from '../../core/data/visitMemoryStore';

// Mock de trackEvent para pruebas
vi.mock('../../core/lib/langfuse.client', () => ({
  trackEvent: vi.fn()
}));

describe('MCP E2E Tests', () => {
  const ANDREINA_VISIT_ID = 'd290f1ee-6c54-4b01-90e6-d701748f0851';
  
  beforeAll(async () => {
    // Inicializar servicios con datos de seed
    visitStore.initializeStore(visitsSeed);
  });

  afterAll(async () => {
    // Limpiar mocks
    vi.clearAllMocks();
  });

  it('debe construir un contexto MCP válido para una visita existente', async () => {
    const builder = new CopilotContextBuilder(new PatientService());
    
    const input = {
      patientData: {
        age: 35,
        sex: 'F' as const,
        clinicalHistory: ['Migraña crónica desde 2023']
      },
      formState: {
        currentInput: 'Paciente refiere dolor lumbar irradiado'
      },
      professional: {
        email: 'dra.garcia@axonvalencia.es'
      },
      visit: {
        id: ANDREINA_VISIT_ID,
        date: new Date('2024-03-15T09:30:00Z'),
        type: 'seguimiento'
      }
    };

    const context = await builder.build(input);

    // Verificar estructura básica
    expect(context).toHaveProperty('patient_state');
    expect(context).toHaveProperty('visit_metadata');
    expect(context).toHaveProperty('rules_and_constraints');
    expect(context).toHaveProperty('system_instructions');
    expect(context).toHaveProperty('enrichment');

    // Verificar datos específicos
    expect(context.visit_metadata.visit_id).toBe(ANDREINA_VISIT_ID);
    expect(context.patient_state.sex).toBe('F');
    expect(context.enrichment.emr.patient_data.name).toContain('Andreina');

    // Verificar que se registró el evento en Langfuse
    expect(trackEvent).toHaveBeenCalledWith('mcp_context_built', {
      visit_id: ANDREINA_VISIT_ID,
      timestamp: expect.any(String)
    });
  });

  it('debe fallar apropiadamente con una visita inexistente', async () => {
    const builder = new CopilotContextBuilder(new PatientService());
    
    const input = {
      patientData: {
        age: 35,
        sex: 'F' as const,
        clinicalHistory: []
      },
      formState: {
        currentInput: ''
      },
      professional: {
        email: 'test@example.com'
      },
      visit: {
        id: 'invalid-uuid',
        date: new Date(),
        type: 'test'
      }
    };

    await expect(builder.build(input)).rejects.toThrow();
    
    // Verificar que se registró el error en Langfuse
    expect(trackEvent).toHaveBeenCalledWith('mcp_error', {
      reason: expect.any(String),
      timestamp: expect.any(String)
    });
  });

  it('debe enriquecer el contexto con datos del EMR', async () => {
    const builder = new CopilotContextBuilder(new PatientService());
    
    const input = {
      patientData: {
        age: 35,
        sex: 'F' as const,
        clinicalHistory: ['Migraña crónica desde 2023']
      },
      formState: {
        currentInput: 'Control rutinario'
      },
      professional: {
        email: 'dra.garcia@axonvalencia.es'
      },
      visit: {
        id: ANDREINA_VISIT_ID,
        date: new Date('2024-03-15T09:30:00Z'),
        type: 'seguimiento'
      }
    };

    const context = await builder.build(input);

    // Verificar datos enriquecidos
    expect(context.enrichment.emr.patient_data).toEqual(
      expect.objectContaining({
        name: expect.any(String),
        allergies: expect.any(Array),
        chronicConditions: expect.any(Array),
        medications: expect.any(Array)
      })
    );

    expect(context.enrichment.emr.visit_history).toBeInstanceOf(Array);
  });
}); 