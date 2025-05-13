import { expectType } from 'tsd';
import type { 
  CopilotSuggestion, 
  PriorityLevel, 
  SeverityLevel, 
  SuggestionType,
  ClinicalContext 
} from '../../src/types/copilot/CopilotSuggestion';
import { Suggestion, SuggestionType as ServiceSuggestionType } from '../../src/modules/copilot/services/CopilotService';
import type { 
  PatientEvaluation, 
  StructuredSuggestion,
  UseCopilotResult
} from '../../src/modules/assistant/hooks/useCopilot';
import type { 
  DetectedPhrase, 
  ValidationResult,
  PhraseCategory
} from '../../src/modules/assistant/components/ActiveListeningPanel';

/**
 * Tests para validar los tipos del sistema de copilot
 */
describe('Copilot Types', () => {
  describe('CopilotSuggestion', () => {
    it('should validate CopilotSuggestion structure', () => {
      const suggestion: CopilotSuggestion = {
        id: '123',
        timestamp: new Date().toISOString(),
        clinicalContextId: 'ctx-123',
        type: 'RECOMMENDATION',
        content: {
          recommendation: {
            title: 'Ejercicios para lumbalgia',
            description: 'Serie de ejercicios específicos',
            priority: 'high'
          }
        },
        status: 'pending',
        metadata: {
          traceId: 'trace-123',
          confidence: 0.95,
          context: {
            patientId: 'patient-123',
            visitId: 'visit-123'
          }
        }
      };
      
      expectType<CopilotSuggestion>(suggestion);
      expectType<string>(suggestion.id);
      expectType<SuggestionType>(suggestion.type);
      expectType<PriorityLevel | undefined>(suggestion.content.recommendation?.priority);
      expectType<ClinicalContext | undefined>(suggestion.metadata?.context);
    });
    
    it('should handle different content types', () => {
      // Text suggestion
      const textSuggestion: CopilotSuggestion = {
        id: '123',
        timestamp: new Date().toISOString(),
        clinicalContextId: 'ctx-123',
        type: 'TEXT',
        content: {
          text: 'Considerar derivación a especialista'
        },
        status: 'pending'
      };
      
      // Checklist suggestion
      const checklistSuggestion: CopilotSuggestion = {
        id: '124',
        timestamp: new Date().toISOString(),
        clinicalContextId: 'ctx-123',
        type: 'CHECKLIST',
        content: {
          items: [
            'Verificar historial familiar',
            'Preguntar sobre alergias',
            'Evaluar rango de movimiento'
          ]
        },
        status: 'pending'
      };
      
      // Alert suggestion
      const alertSuggestion: CopilotSuggestion = {
        id: '125',
        timestamp: new Date().toISOString(),
        clinicalContextId: 'ctx-123',
        type: 'ALERT',
        content: {
          alert: {
            message: 'Posible interacción medicamentosa',
            severity: 'warning'
          }
        },
        status: 'pending'
      };
      
      expectType<CopilotSuggestion>(textSuggestion);
      expectType<CopilotSuggestion>(checklistSuggestion);
      expectType<CopilotSuggestion>(alertSuggestion);
      expectType<string | undefined>(textSuggestion.content.text);
      expectType<string[] | undefined>(checklistSuggestion.content.items);
      expectType<SeverityLevel | undefined>(alertSuggestion.content.alert?.severity);
    });
  });
  
  describe('CopilotService', () => {
    it('should validate Suggestion type', () => {
      const suggestion: Suggestion = {
        type: 'alert',
        message: 'Dato importante faltante',
        severity: 'warning'
      };
      
      expectType<Suggestion>(suggestion);
      expectType<ServiceSuggestionType>(suggestion.type);
      expectType<SeverityLevel | undefined>(suggestion.severity);
    });
  });
  
  describe('useCopilot hook', () => {
    it('should validate PatientEvaluation type', () => {
      const evaluation: PatientEvaluation = {
        patientId: 'patient-123',
        visitId: 'visit-123',
        voiceApprovedNotes: [
          'Dolor en zona lumbar',
          'Limitación de movimiento'
        ],
        metadata: {
          traceId: 'trace-123'
        }
      };
      
      expectType<PatientEvaluation>(evaluation);
      expectType<string>(evaluation.patientId);
      expectType<string | undefined>(evaluation.visitId);
      expectType<string[] | undefined>(evaluation.voiceApprovedNotes);
    });
    
    it('should validate StructuredSuggestion type', () => {
      const structuredSuggestion: StructuredSuggestion = {
        symptoms: ['Dolor lumbar', 'Rigidez'],
        diagnosis: 'Lumbalgia mecánica',
        treatmentPlan: 'Ejercicios específicos y terapia manual'
      };
      
      expectType<StructuredSuggestion>(structuredSuggestion);
      expectType<string[] | undefined>(structuredSuggestion.symptoms);
      expectType<string | undefined>(structuredSuggestion.diagnosis);
    });
    
    it('should validate UseCopilotResult type', () => {
      const hookResult: UseCopilotResult = {
        suggestions: null,
        isLoading: false,
        submitSuggestionFeedback: async () => {},
        analyzeVoiceNotes: async () => {}
      };
      
      expectType<UseCopilotResult>(hookResult);
      expectType<boolean>(hookResult.isLoading);
      expectType<StructuredSuggestion | null>(hookResult.suggestions);
    });
  });
  
  describe('ActiveListening types', () => {
    it('should validate DetectedPhrase type', () => {
      const phrase: DetectedPhrase = {
        id: 'phrase-123',
        text: 'Dolor en articulación de rodilla',
        category: 'Síntoma',
        approved: true,
        timestamp: new Date().toISOString()
      };
      
      expectType<DetectedPhrase>(phrase);
      expectType<string>(phrase.id);
      expectType<PhraseCategory | undefined>(phrase.category);
      expectType<boolean>(phrase.approved);
    });
    
    it('should validate ValidationResult type', () => {
      const result: ValidationResult = {
        approvedPhrases: ['Dolor en rodilla', 'Limitación para subir escaleras'],
        rejectedPhrases: ['Alergia al sol'],
        traceId: 'trace-123'
      };
      
      expectType<ValidationResult>(result);
      expectType<string[]>(result.approvedPhrases);
      expectType<string[]>(result.rejectedPhrases);
      expectType<string>(result.traceId);
    });
  });
}); 