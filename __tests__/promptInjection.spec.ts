import CopilotService from '../src/modules/ai/CopilotService';

describe('Prompt Injection Protection', () => {
  it('should not execute dangerous actions from malicious prompts', () => {
    const maliciousPrompt = "DELETE * FROM users;";
    const result = CopilotService.analyzeEval({
      id: '1',
      patientId: '1',
      visitDate: '2023-01-01',
      motivo: 'Test',
      observaciones: 'Test',
      diagnostico: maliciousPrompt,
      alertas: [],
      feedback: []
    });
    expect(result).not.toContain('DELETE');
  });
}); 