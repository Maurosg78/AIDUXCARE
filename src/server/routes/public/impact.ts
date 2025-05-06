import { NextApiRequest, NextApiResponse } from 'next';
import { Langfuse } from 'langfuse-node';
import { evaluatePatientVisit } from '@/utils/evals/structuredVisit';

interface LangfuseTrace {
  id: string;
  startTime: string;
  metadata?: {
    patientId?: string;
  };
}

interface LangfuseResponse {
  data: LangfuseTrace[];
}

const langfuse = new Langfuse({
  publicKey: process.env.VITE_LANGFUSE_PUBLIC_KEY || '',
  secretKey: process.env.LANGFUSE_SECRET_KEY || '',
  baseUrl: process.env.VITE_LANGFUSE_BASE_URL || ''
});

interface ImpactStats {
  avgScore: number;
  percentHighQuality: number;
  topMissingFields: Array<{ field: string; count: number }>;
  topWarnings: Array<{ warning: string; count: number }>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ImpactStats | { message: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    // Obtener traces de los últimos 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const response = await langfuse.getTraces({
      startTime: thirtyDaysAgo.toISOString(),
      name: 'form.update'
    }) as LangfuseResponse;

    const traces = response.data;

    // Agrupar por paciente (último trace por paciente)
    const patientTraces = new Map<string, LangfuseTrace>();
    for (const trace of traces) {
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
    if (totalEvals === 0) {
      return res.status(200).json({
        avgScore: 0,
        percentHighQuality: 0,
        topMissingFields: [],
        topWarnings: []
      });
    }

    // Promedio de scores
    const avgScore = Math.round(
      evaluations.reduce((sum, evaluation) => sum + evaluation.completenessScore, 0) / totalEvals
    );

    // Porcentaje de alta calidad (>80)
    const highQualityCount = evaluations.filter(evaluation => evaluation.completenessScore > 80).length;
    const percentHighQuality = Math.round((highQualityCount / totalEvals) * 100);

    // Campos faltantes más comunes
    const missingFieldsCount = new Map<string, number>();
    evaluations.forEach(evaluation => {
      evaluation.missingFields.forEach(field => {
        missingFieldsCount.set(field, (missingFieldsCount.get(field) || 0) + 1);
      });
    });

    const topMissingFields = Array.from(missingFieldsCount.entries())
      .map(([field, count]) => ({ field, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Advertencias más comunes
    const warningsCount = new Map<string, number>();
    evaluations.forEach(evaluation => {
      evaluation.warnings.forEach(warning => {
        warningsCount.set(warning, (warningsCount.get(warning) || 0) + 1);
      });
    });

    const topWarnings = Array.from(warningsCount.entries())
      .map(([warning, count]) => ({ warning, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return res.status(200).json({
      avgScore,
      percentHighQuality,
      topMissingFields,
      topWarnings
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de impacto:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
} 