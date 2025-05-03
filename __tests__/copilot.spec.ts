import { CopilotService } from '../src/modules/copilot/services/CopilotService';
import { logEvalTest } from '../src/core/analytics/InteractionLogger';

describe('CopilotService', () => {
  it('should handle omission correctly', () => {
    const result = CopilotService.analyzeEval({ type: 'omission' });
    expect(result).toBeDefined();
    logEvalTest('omission', true);
  });

  it('should handle suggestion correctly', () => {
    const result = CopilotService.analyzeEval({ type: 'suggestion' });
    expect(result).toBeDefined();
    logEvalTest('suggestion', true);
  });

  it('should handle risk correctly', () => {
    const result = CopilotService.analyzeEval({ type: 'risk' });
    expect(result).toBeDefined();
    logEvalTest('risk', true);
  });
}); 