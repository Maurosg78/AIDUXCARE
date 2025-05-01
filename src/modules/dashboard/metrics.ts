import { Evaluation } from '../emr/types/Evaluation';

export interface PatientAlert {
  patientId: string;
  patientName: string;
  alerts: Array<{ message: string }>;
}

export interface DiagnosticCount {
  diagnosis: string;
  count: number;
}

export interface DashboardMetrics {
  totalEvaluations: number;
  withFeedback: number;
  withAlerts: number;
  feedbackTypes: {
    omission: number;
    suggestion: number;
    diagnostic: number;
    risk: number;
  };
  patientsWithAlerts: PatientAlert[];
  topDiagnostics: DiagnosticCount[];
}

export function processMetrics(evaluations: Evaluation[]): DashboardMetrics {
  const metrics: DashboardMetrics = {
    totalEvaluations: evaluations.length,
    withFeedback: 0,
    withAlerts: 0,
    feedbackTypes: {
      omission: 0,
      suggestion: 0,
      diagnostic: 0,
      risk: 0
    },
    patientsWithAlerts: [],
    topDiagnostics: []
  };

  const patientAlerts = new Map<string, PatientAlert>();
  const diagnosticCounts = new Map<string, number>();

  evaluations.forEach(evaluation => {
    // Contar evaluaciones con feedback
    if (evaluation.feedback && evaluation.feedback.length > 0) {
      metrics.withFeedback++;
      evaluation.feedback.forEach(f => {
        if (f.type in metrics.feedbackTypes) {
          metrics.feedbackTypes[f.type as keyof typeof metrics.feedbackTypes]++;
        }
      });
    }

    // Contar evaluaciones con alertas
    if (evaluation.alertas && evaluation.alertas.length > 0) {
      metrics.withAlerts++;
      
      // Agrupar alertas por paciente
      const existing = patientAlerts.get(evaluation.patientId) || {
        patientId: evaluation.patientId,
        patientName: `Paciente ${evaluation.patientId}`,
        alerts: []
      };
      
      existing.alerts = evaluation.alertas.map(alerta => ({ message: alerta }));
      patientAlerts.set(evaluation.patientId, existing);
    }

    // Contar diagnósticos
    if (evaluation.diagnostico) {
      const count = diagnosticCounts.get(evaluation.diagnostico) || 0;
      diagnosticCounts.set(evaluation.diagnostico, count + 1);
    }
  });

  // Convertir mapas a arrays
  metrics.patientsWithAlerts = Array.from(patientAlerts.values());
  metrics.topDiagnostics = Array.from(diagnosticCounts.entries())
    .map(([diagnosis, count]) => ({ diagnosis, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return metrics;
} 