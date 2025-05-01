import { PatientEval } from '../emr/services/EvalService';

export interface CopilotFeedback {
  type: 'omission' | 'suggestion' | 'diagnostic' | 'risk';
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

class CopilotService {
  static analyzeEval(evaluation: PatientEval): CopilotFeedback[] {
    const feedbacks: CopilotFeedback[] = [];

    // Verificar campos obligatorios
    if (!evaluation.exploracionFisica.hallazgos.length) {
      feedbacks.push({
        type: 'omission',
        message: 'No se documentaron hallazgos en la exploración física',
        severity: 'warning'
      });
    }

    // Sugerir tests clínicos según el motivo de la visita
    if (evaluation.motivo === 'trauma' && !evaluation.escalasUtilizadas.includes('Escala de Oswestry')) {
      feedbacks.push({
        type: 'suggestion',
        message: 'Considerar usar la Escala de Oswestry para evaluar la discapacidad lumbar',
        severity: 'info'
      });
    }

    if (evaluation.motivo === 'postoperatorio' && !evaluation.escalasUtilizadas.includes('Harris Hip Score')) {
      feedbacks.push({
        type: 'suggestion',
        message: 'Recomendado usar Harris Hip Score para evaluar la recuperación post-operatoria',
        severity: 'info'
      });
    }

    // Sugerir diagnósticos alternativos según síntomas
    if (evaluation.motivo === 'trauma' && 
        evaluation.observaciones.toLowerCase().includes('dolor lumbar') &&
        !evaluation.diagnostico.toLowerCase().includes('hernia')) {
      feedbacks.push({
        type: 'diagnostic',
        message: 'Considerar evaluación para posible hernia discal lumbar',
        severity: 'warning'
      });
    }

    // Advertencias de riesgo
    if (evaluation.motivo === 'postoperatorio' && 
        evaluation.observaciones.toLowerCase().includes('fiebre') &&
        evaluation.observaciones.toLowerCase().includes('dolor')) {
      feedbacks.push({
        type: 'risk',
        message: 'Posible infección post-operatoria. Considerar evaluación urgente',
        severity: 'critical'
      });
    }

    // Verificar escalas utilizadas según diagnóstico
    if (evaluation.diagnostico.toLowerCase().includes('ela') && 
        !evaluation.escalasUtilizadas.includes('ALSFRS-R')) {
      feedbacks.push({
        type: 'suggestion',
        message: 'Recomendado usar ALSFRS-R para seguimiento de ELA',
        severity: 'warning'
      });
    }

    return feedbacks;
  }
}

export default CopilotService; 