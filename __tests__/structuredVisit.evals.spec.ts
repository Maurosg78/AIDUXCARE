import CopilotService from '../src/modules/ai/CopilotService';
import { PatientEval } from '../src/modules/emr/services/EvalService';
import { CopilotFeedback } from '../src/modules/ai/CopilotService';
import simulatedData from '../src/public-data/evals-simulated.json';

describe('Structured Visit Form Copilot Integration', () => {
  const mockEvaluations: PatientEval[] = simulatedData.evaluations;

  // Función auxiliar para clasificar el feedback
  const classifyFeedback = (feedback: CopilotFeedback[]) => {
    return feedback.reduce((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = [];
      }
      acc[item.type].push({
        message: item.message,
        severity: item.severity
      });
      return acc;
    }, {} as Record<string, { message: string; severity: string }[]>);
  };

  describe('Feedback Generation', () => {
    test.each(mockEvaluations)(
      'should generate appropriate feedback for patient $patientId',
      async (evaluation) => {
        // Simular datos del formulario
        const formData: PatientEval = {
          ...evaluation,
          feedback: [], // Limpiar feedback previo
        };

        // Obtener feedback del copiloto
        const feedback = await CopilotService.analyzeEval(formData);

        // Verificaciones básicas
        expect(feedback).toBeDefined();
        expect(feedback.length).toBeGreaterThan(0);

        // Clasificar y documentar el feedback
        const classifiedFeedback = classifyFeedback(feedback);
        console.log(`\nFeedback para paciente ${evaluation.patientId}:`);
        Object.entries(classifiedFeedback).forEach(([type, items]) => {
          console.log(`  ${type}:`);
          items.forEach(item => {
            console.log(`    - ${item.message} (${item.severity})`);
          });
        });

        // Verificar tipos específicos de feedback
        if (classifiedFeedback['suggestion']) {
          expect(classifiedFeedback['suggestion'].length).toBeGreaterThan(0);
          classifiedFeedback['suggestion'].forEach(item => {
            expect(item.severity).toBe('info');
          });
        }

        if (classifiedFeedback['risk']) {
          expect(classifiedFeedback['risk'].length).toBeGreaterThan(0);
          classifiedFeedback['risk'].forEach(item => {
            expect(['warning', 'error']).toContain(item.severity);
          });
        }

        if (classifiedFeedback['omission']) {
          expect(classifiedFeedback['omission'].length).toBeGreaterThan(0);
          classifiedFeedback['omission'].forEach(item => {
            expect(['warning', 'error']).toContain(item.severity);
          });
        }
      }
    );

    test('should handle empty or incomplete form data', async () => {
      const incompleteFormData: PatientEval = {
        id: 'test-incomplete',
        patientId: 'test-patient',
        visitDate: new Date().toISOString(),
        motivo: '',
        observaciones: '',
        diagnostico: '',
        alertas: [],
        feedback: []
      };

      const feedback = await CopilotService.analyzeEval(incompleteFormData);
      
      // Verificar que se detectan omisiones
      expect(feedback.some(item => item.type === 'omission')).toBe(true);
      
      const omissions = feedback.filter(item => item.type === 'omission');
      console.log('\nFeedback para formulario incompleto:');
      omissions.forEach(item => {
        console.log(`  - ${item.message} (${item.severity})`);
        expect(item.severity).toBe('warning');
      });
    });
  });

  describe('Suggestion Application', () => {
    test('should generate valid suggestions that can be applied', async () => {
      const evaluation = mockEvaluations[0]; // Usar el primer caso como ejemplo
      const feedback = await CopilotService.analyzeEval(evaluation);
      
      const suggestions = feedback.filter(item => item.type === 'suggestion');
      
      if (suggestions.length > 0) {
        console.log('\nSugerencias aplicables:');
        suggestions.forEach(suggestion => {
          console.log(`  - ${suggestion.message}`);
          expect(suggestion.message).toBeTruthy();
          expect(suggestion.severity).toBe('info');
        });
      }
    });
  });
}); 