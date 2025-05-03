import { NextApiRequest, NextApiResponse } from 'next';
import { Langfuse } from 'langfuse-node';
import { evaluatePatientVisit } from '@/utils/evals/structuredVisit';

const langfuse = new Langfuse({
  publicKey: process.env.VITE_LANGFUSE_PUBLIC_KEY || '',
  secretKey: process.env.VITE_LANGFUSE_SECRET_KEY || '',
  baseUrl: process.env.VITE_LANGFUSE_HOST || 'https://cloud.langfuse.com'
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    // Obtener traces de los últimos 7 días
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const traces = await langfuse.getTraces({
      startTime: sevenDaysAgo.toISOString(),
      limit: 100,
      name: 'form.update'
    });

    // Agrupar por paciente y obtener evaluaciones
    const patientTraces = new Map<string, any>();
    for (const trace of traces.data) {
      const patientId = trace.metadata?.patientId;
      if (patientId && !patientTraces.has(patientId)) {
        patientTraces.set(patientId, trace);
      }
    }

    // Realizar evaluaciones para cada paciente
    const patientActivity = await Promise.all(
      Array.from(patientTraces.entries()).map(async ([patientId, trace]) => {
        const evaluation = await evaluatePatientVisit(langfuse, trace.id);
        return {
          patientId,
          traceId: trace.id,
          lastUpdate: trace.startTime,
          completenessScore: evaluation.completenessScore,
          missingFields: evaluation.missingFields,
          warnings: evaluation.warnings
        };
      })
    );

    return res.status(200).json({
      patients: patientActivity
    });
  } catch (error) {
    console.error('Error al obtener actividad de pacientes:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
} 