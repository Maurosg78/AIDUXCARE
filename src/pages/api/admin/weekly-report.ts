import { NextApiRequest, NextApiResponse } from 'next';
import { Langfuse } from 'langfuse-node';
import { evaluatePatientVisit } from '@/utils/evals/structuredVisit';
import Papa from 'papaparse';

const langfuse = new Langfuse({
  publicKey: process.env.VITE_LANGFUSE_PUBLIC_KEY || '',
  secretKey: process.env.VITE_LANGFUSE_SECRET_KEY || '',
  baseUrl: process.env.VITE_LANGFUSE_HOST || 'https://cloud.langfuse.com'
});

interface WeeklyStats {
  period: {
    start: string;
    end: string;
  };
  metrics: {
    totalFormUpdates: number;
    totalFeedback: number;
    avgCompletenessScore: number;
    topMissingFields: Array<{ field: string; count: number }>;
    topWarnings: Array<{ warning: string; count: number }>;
  };
}

async function generateWeeklyReport(): Promise<WeeklyStats> {
  // Obtener datos de los últimos 7 días
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const traces = await langfuse.getTraces({
    startTime: sevenDaysAgo.toISOString(),
    limit: 1000,
    name: 'form.update'
  });

  // Agrupar por paciente (último trace por paciente)
  const patientTraces = new Map<string, any>();
  for (const trace of traces.data) {
    const patientId = trace.metadata?.patientId;
    if (patientId) {
      const existingTrace = patientTraces.get(patientId);
      if (!existingTrace || new Date(trace.startTime) > new Date(existingTrace.startTime)) {
        patientTraces.set(patientId, trace);
      }
    }
  }

  // Realizar evaluaciones
  const evaluations = await Promise.all(
    Array.from(patientTraces.values()).map(trace => 
      evaluatePatientVisit(langfuse, trace.id)
    )
  );

  // Calcular estadísticas
  const totalEvals = evaluations.length;
  const avgScore = totalEvals > 0
    ? Math.round(evaluations.reduce((sum, eval) => sum + eval.completenessScore, 0) / totalEvals)
    : 0;

  // Contar campos faltantes
  const missingFieldsCount = new Map<string, number>();
  evaluations.forEach(eval => {
    eval.missingFields.forEach(field => {
      missingFieldsCount.set(field, (missingFieldsCount.get(field) || 0) + 1);
    });
  });

  const topMissingFields = Array.from(missingFieldsCount.entries())
    .map(([field, count]) => ({ field, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Contar advertencias
  const warningsCount = new Map<string, number>();
  evaluations.forEach(eval => {
    eval.warnings.forEach(warning => {
      warningsCount.set(warning, (warningsCount.get(warning) || 0) + 1);
    });
  });

  const topWarnings = Array.from(warningsCount.entries())
    .map(([warning, count]) => ({ warning, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Contar eventos por tipo
  const totalFormUpdates = traces.data.filter(t => t.name === 'form.update').length;
  const totalFeedback = traces.data.filter(t => t.name === 'copilot.feedback').length;

  return {
    period: {
      start: sevenDaysAgo.toISOString(),
      end: new Date().toISOString()
    },
    metrics: {
      totalFormUpdates,
      totalFeedback,
      avgCompletenessScore: avgScore,
      topMissingFields,
      topWarnings
    }
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const report = await generateWeeklyReport();
    const format = req.query.format || 'json';

    if (format === 'csv') {
      // Preparar datos para CSV
      const csvData = [
        ['Período', 'Inicio', 'Fin'],
        ['', report.period.start, report.period.end],
        [],
        ['Métricas', 'Valor'],
        ['Total Actualizaciones de Formulario', report.metrics.totalFormUpdates],
        ['Total Feedbacks', report.metrics.totalFeedback],
        ['Score Promedio de Completitud', `${report.metrics.avgCompletenessScore}%`],
        [],
        ['Top 5 Campos Faltantes', 'Cantidad'],
        ...report.metrics.topMissingFields.map(({ field, count }) => [field, count]),
        [],
        ['Top 5 Advertencias', 'Cantidad'],
        ...report.metrics.topWarnings.map(({ warning, count }) => [warning, count])
      ];

      const csv = Papa.unparse(csvData);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=weekly-report.csv');
      return res.status(200).send(csv);
    }

    return res.status(200).json(report);
  } catch (error) {
    console.error('Error al generar reporte semanal:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
} 