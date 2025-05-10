import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContextEnricher, EnrichedMCPContextSchema } from '../ContextEnricher';
import { PatientService } from '@/core/services/patient/PatientService';
import { MCPContext } from '../CopilotContextBuilder';

describe('ContextEnricher', () => {
  // Crear mocks tipados
  const mockGetPatientData = vi.fn();
  const mockGetVisitHistory = vi.fn();
  
  const mockPatientService = {
    getPatientData: mockGetPatientData,
    getVisitHistory: mockGetVisitHistory
  } as unknown as PatientService;

  const baseContext: MCPContext = {
    user_input: 'Paciente refiere dolor lumbar',
    patient_state: {
      age: 45,
      sex: 'M',
      history: ['HTA']
    },
    visit_metadata: {
      visit_id: crypto.randomUUID(),
      date: new Date().toISOString(),
      professional: 'doctor@example.com'
    },
    rules_and_constraints: [],
    system_instructions: 'Test instructions',
    enrichment: {}
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe enriquecer un contexto básico con historial clínico', async () => {
    const mockPatientData = {
      id: baseContext.visit_metadata.visit_id,
      name: 'Juan Pérez',
      birthDate: new Date().toISOString(),
      allergies: ['Penicilina'],
      chronicConditions: ['Hipertensión'],
      medications: ['Enalapril']
    };

    const mockVisitHistory = [
      {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        type: 'Control',
        summary: 'Paciente estable',
        professional: 'doctor@example.com'
      }
    ];

    mockGetPatientData.mockResolvedValue(mockPatientData);
    mockGetVisitHistory.mockResolvedValue(mockVisitHistory);

    const enricher = new ContextEnricher(mockPatientService);
    const enrichedContext = await enricher.enrich(baseContext);

    expect(enrichedContext.enrichment).toBeDefined();
    const enrichment = enrichedContext.enrichment!;
    
    expect(enrichment.emr).toBeDefined();
    expect(enrichment.emr!.patient_data).toEqual(mockPatientData);
    expect(enrichment.emr!.visit_history).toEqual(mockVisitHistory);
    expect(enrichment.global_rules).toBeDefined();
  });

  it('debe manejar correctamente un paciente sin visitas previas', async () => {
    mockGetPatientData.mockResolvedValue(null);
    mockGetVisitHistory.mockResolvedValue([]);

    const enricher = new ContextEnricher(mockPatientService);
    const enrichedContext = await enricher.enrich(baseContext);

    expect(enrichedContext.enrichment).toBeDefined();
    const enrichment = enrichedContext.enrichment!;
    
    expect(enrichment.emr).toBeDefined();
    expect(enrichment.emr!.patient_data).toBeNull();
    expect(enrichment.emr!.visit_history).toEqual([]);
    expect(enrichment.emr!.error).toBeDefined();
  });

  it('debe validar que el resultado cumple el esquema MCPContext', async () => {
    mockGetPatientData.mockResolvedValue({
      id: baseContext.visit_metadata.visit_id,
      name: 'Juan Pérez',
      birthDate: new Date().toISOString(),
      allergies: [],
      chronicConditions: [],
      medications: []
    });
    mockGetVisitHistory.mockResolvedValue([]);

    const enricher = new ContextEnricher(mockPatientService);
    const enrichedContext = await enricher.enrich(baseContext);

    expect(() => {
      EnrichedMCPContextSchema.parse(enrichedContext);
    }).not.toThrow();
  });
}); 