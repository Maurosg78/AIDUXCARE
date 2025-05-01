import { PatientEval } from '../emr/services/EvalService';
import CopilotService, { CopilotFeedback } from '../ai/CopilotService';

export interface DashboardMetrics {
  totalEvaluations: number;
  evaluationsWithFeedback: number;
  feedbackByType: {
    omission: number;
    suggestion: number;
    diagnostic: number;
    risk: number;
  };
  criticalAlerts: number;
  patientsWithAlerts: Array<{
    patientId: string;
    patientName: string;
    alerts: CopilotFeedback[];
  }>;
  topDiagnostics: Array<{
    diagnosis: string;
    count: number;
  }>;
}

export function processMetrics(evaluations: PatientEval[]): DashboardMetrics {
  const feedbackByType = {
    omission: 0,
    suggestion: 0,
    diagnostic: 0,
    risk: 0
  };

  const patientsWithAlerts: DashboardMetrics['patientsWithAlerts'] = [];
  const diagnosticCounts = new Map<string, number>();

  evaluations.forEach(evaluation => {
    const feedbacks = CopilotService.analyzeEval(evaluation);
    
    // Contar por tipo
    feedbacks.forEach(feedback => {
      feedbackByType[feedback.type]++;
      
      // Contar diagnósticos sugeridos
      if (feedback.type === 'diagnostic') {
        const currentCount = diagnosticCounts.get(feedback.message) || 0;
        diagnosticCounts.set(feedback.message, currentCount + 1);
      }
    });

    // Recolectar pacientes con alertas
    const criticalFeedbacks = feedbacks.filter(f => f.severity === 'critical');
    if (criticalFeedbacks.length > 0) {
      const patientName = evaluation.observaciones.split(',')[0].replace('Paciente ', '');
      patientsWithAlerts.push({
        patientId: evaluation.patientId,
        patientName,
        alerts: criticalFeedbacks
      });
    }
  });

  // Ordenar diagnósticos por frecuencia
  const topDiagnostics = Array.from(diagnosticCounts.entries())
    .map(([diagnosis, count]) => ({ diagnosis, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return {
    totalEvaluations: evaluations.length,
    evaluationsWithFeedback: evaluations.filter(e => CopilotService.analyzeEval(e).length > 0).length,
    feedbackByType,
    criticalAlerts: feedbackByType.risk,
    patientsWithAlerts,
    topDiagnostics
  };
} 