import { PatientEval } from '../emr/services/EvalService';

export interface CopilotFeedback {
  type: 'omission' | 'suggestion' | 'diagnostic' | 'risk';
  severity: 'info' | 'warning' | 'error';
  message: string;
}

class CopilotService {
  static analyzeEval(evaluation: PatientEval): CopilotFeedback[] {
    const feedback: CopilotFeedback[] = [];

    // Verificar campos obligatorios
    if (!evaluation.motivo || !evaluation.observaciones || !evaluation.diagnostico) {
      feedback.push({
        type: 'omission',
        severity: 'warning',
        message: 'Hay campos obligatorios sin completar'
      });
    }

    // Analizar alertas existentes
    if (evaluation.alertas.length > 0) {
      feedback.push({
        type: 'risk',
        severity: 'warning',
        message: 'Se han detectado alertas que requieren atención'
      });
    }

    // Sugerencias basadas en el diagnóstico
    if (evaluation.diagnostico.toLowerCase().includes('lumbalgia')) {
      feedback.push({
        type: 'suggestion',
        severity: 'info',
        message: 'Considerar evaluación de movilidad pélvica'
      });
    }

    // Diagnósticos alternativos
    if (evaluation.diagnostico.toLowerCase().includes('cervicalgia')) {
      feedback.push({
        type: 'diagnostic',
        severity: 'info',
        message: 'Considerar evaluación de compromiso radicular'
      });
    }

    return feedback;
  }
}

export default CopilotService; 