import { NextApiRequest, NextApiResponse } from 'next';
import { Langfuse } from 'langfuse-node';
import type { LangfuseTrace, GetTracesOptions  } from '@/types/langfuse.events';

interface LangfuseResponse {
  data: LangfuseTrace[];
}

// Extender Langfuse con los métodos necesarios
interface ExtendedLangfuse extends Langfuse {
  getTraces(options: GetTracesOptions): Promise<LangfuseResponse>;
}

const langfuse = new Langfuse({
  publicKey: process.env.VITE_LANGFUSE_PUBLIC_KEY || '',
  secretKey: process.env.VITE_LANGFUSE_SECRET_KEY || '',
  baseUrl: process.env.VITE_LANGFUSE_HOST || 'https://cloud.langfuse.com'
}) as ExtendedLangfuse;

interface PatientActivity {
  patientId: string;
  lastUpdate: string;
  totalEvents: number;
  visitCount: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const response = await langfuse.getTraces({
      startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
      limit: 1000
    });

    const traces = response.data || [];
    const patientActivityMap = new Map<string, PatientActivity>();

    // Agrupar por paciente
    traces.forEach(trace => {
      const patientId = trace.metadata?.patientId;
      if (!patientId) return;

      if (!patientActivityMap.has(patientId)) {
        patientActivityMap.set(patientId, {
          patientId,
          lastUpdate: trace.startTime,
          totalEvents: 1,
          visitCount: 1
        });
      } else {
        const activity = patientActivityMap.get(patientId)!;
        activity.totalEvents++;
        
        // Actualizar última actualización si es más reciente
        if (new Date(trace.startTime) > new Date(activity.lastUpdate)) {
          activity.lastUpdate = trace.startTime;
        }
      }
    });

    // Convertir a array y ordenar por fecha descendente
    const patientActivity = Array.from(patientActivityMap.values())
      .sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime());

    res.status(200).json({
      patients: patientActivity,
      totalPatients: patientActivityMap.size,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error al obtener actividad de pacientes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
} 