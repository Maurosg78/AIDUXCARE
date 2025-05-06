import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CopilotContextBuilder } from '../CopilotContextBuilder';
import { PatientService } from '../../services/PatientService';
import { visitExists } from '../../services/VisitService';
import { trackEvent } from '../../lib/langfuse.client';

// Mock de visitExists
jest.mock('../../services/VisitService');
const mockVisitExists = visitExists as jest.MockedFunction<typeof visitExists>;

// Mock de trackEvent
jest.mock('../../lib/langfuse.client');
const mockTrackEvent = trackEvent as jest.MockedFunction<typeof trackEvent>;

describe('CopilotContextBuilder', () => {
  const mockGetPatientData = vi.fn();
  const mockGetVisitHistory = vi.fn();
  
  const mockPatientService = {
    getPatientData: mockGetPatientData,
    getVisitHistory: mockGetVisitHistory
  } as unknown as PatientService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPatientData.mockResolvedValue(null);
    mockGetVisitHistory.mockResolvedValue([]);
    mockVisitExists.mockReturnValue(true); // Por defecto, las visitas existen
  });

  const validInput = {
    patientData: {
      age: 42,
      sex: 'F' as const,
      clinicalHistory: ['Dolor lumbar crónico', 'HTA controlada']
    },
    formState: {
      currentInput: 'Paciente refiere dolor lumbar intenso'
    },
    professional: {
      email: 'mauricio@axonvalencia.es'
    },
    visit: {
      id: 'c7d6f3e1-7a9b-4c1d-8a9e-3c6d7f3e1a9b',
      date: new Date('2024-03-20T10:00:00Z'),
      type: 'Primera visita'
    }
  };

  it('debe construir un contexto MCP válido', async () => {
    const builder = new CopilotContextBuilder(mockPatientService);
    const context = await builder.build(validInput);

    expect(context).toMatchObject({
      user_input: validInput.formState.currentInput,
      patient_state: {
        age: validInput.patientData.age,
        sex: validInput.patientData.sex,
        history: validInput.patientData.clinicalHistory
      },
      visit_metadata: {
        visit_id: validInput.visit.id,
        professional: validInput.professional.email
      }
    });

    expect(context.rules_and_constraints).toBeInstanceOf(Array);
    expect(context.system_instructions).toBeTruthy();
    expect(context.enrichment).toBeDefined();
    expect(mockTrackEvent).toHaveBeenCalledWith('mcp_context_built', expect.any(Object));
  });

  it('debe fallar con datos inválidos', async () => {
    const invalidInput = {
      patientData: {
        age: -1, // Edad inválida
        sex: 'X' as any, // Sexo inválido
        clinicalHistory: []
      },
      formState: {
        currentInput: ''
      },
      professional: {
        email: 'invalid-email' // Email inválido
      },
      visit: {
        id: 'invalid-uuid', // UUID inválido
        date: new Date(),
        type: ''
      }
    };

    const builder = new CopilotContextBuilder(mockPatientService);
    await expect(builder.build(invalidInput)).rejects.toThrow();
  });

  it('debe incluir datos enriquecidos del EMR', async () => {
    const mockPatientData = {
      id: validInput.visit.id,
      name: 'Test Patient',
      birthDate: new Date().toISOString(),
      allergies: ['Test Allergy'],
      chronicConditions: ['Test Condition'],
      medications: ['Test Med']
    };

    mockGetPatientData.mockResolvedValue(mockPatientData);
    mockGetVisitHistory.mockResolvedValue([
      {
        id: 'test-visit-id',
        date: new Date().toISOString(),
        type: 'Test Visit',
        summary: 'Test Summary',
        professional: 'test@example.com'
      }
    ]);

    const builder = new CopilotContextBuilder(mockPatientService);
    const context = await builder.build(validInput);

    expect(context.enrichment).toBeDefined();
    const enrichment = context.enrichment!;
    
    expect(enrichment.emr).toBeDefined();
    expect(enrichment.emr!.patient_data).toEqual(mockPatientData);
    expect(enrichment.emr!.visit_history).toHaveLength(1);
  });

  it('debe lanzar error si el visitId no existe', async () => {
    mockVisitExists.mockReturnValue(false);

    const builder = new CopilotContextBuilder(mockPatientService);
    const invalidInput = {
      ...validInput,
      visit: {
        ...validInput.visit,
        id: 'invalid-visit-id'
      }
    };

    await expect(builder.build(invalidInput)).rejects.toThrow('Visita no encontrada');
    expect(mockTrackEvent).toHaveBeenCalledWith('mcp_error', {
      reason: 'invalid_visit_id',
      visit_id: 'invalid-visit-id',
      timestamp: expect.any(String)
    });
  });

  it('debe validar el formato del visitId', async () => {
    const builder = new CopilotContextBuilder(mockPatientService);
    const invalidInput = {
      ...validInput,
      visit: {
        ...validInput.visit,
        id: 'not-a-uuid'
      }
    };

    await expect(builder.build(invalidInput)).rejects.toThrow('Invalid UUID');
    expect(mockTrackEvent).toHaveBeenCalledWith('mcp_error', {
      reason: 'validation_error',
      error: 'Invalid UUID',
      timestamp: expect.any(String)
    });
  });
}); 