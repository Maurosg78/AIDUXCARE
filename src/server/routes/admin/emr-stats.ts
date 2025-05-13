import { NextApiRequest, NextApiResponse } from 'next';
import { Langfuse } from 'langfuse-node';
// Definir interfaces localmente para evitar problemas de namespace
interface LangfuseObservation {
  id: string;
  name?: string;
  startTime?: string | Date;
  endTime?: string | Date;
  traceId?: string;
  metadata?: Record<string, unknown>;
  level?: string;
  statusMessage?: string;
  version?: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  [key: string]: unknown;
}

interface LangfuseTrace {
  id: string;
  name?: string;
  userId?: string;
  startTime?: string | Date;
  endTime?: string | Date;
  metadata?: Record<string, unknown>;
  observations?: LangfuseObservation[];
  version?: string;
  tags?: string[];
  [key: string]: unknown;
}

interface GetTracesOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
  filter?: Record<string, unknown>;
  [key: string]: unknown;
}

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

interface DailyStats {
  date: string;
  formUpdates: number;
  feedbacks: number;
}

interface FieldStats {
  field: string;
  count: number;
}

interface EMRStats {
  dailyStats: DailyStats[];
  topFields: FieldStats[];
  averageEventsPerVisit: number;
  lastUpdated: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const response = await langfuse.getTraces({
      startTime: sevenDaysAgo.toISOString()
    });

    const traces = response.data;

    // Inicializar estadísticas diarias
    const dailyStatsMap = new Map<string, DailyStats>();
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyStatsMap.set(dateStr, {
        date: dateStr,
        formUpdates: 0,
        feedbacks: 0
      });
    }

    // Contador de campos modificados
    const fieldCounts = new Map<string, number>();
    const uniquePatients = new Set<string>();
    let totalEvents = 0;

    // Procesar cada trace
    traces.forEach(trace => {
      const patientId = trace.metadata?.patientId;
      if (patientId) {
        uniquePatients.add(patientId);
      }

      // Si observations es undefined o no es un array, lo tratamos como un array vacío
      const observations = Array.isArray(trace.observations) ? trace.observations : [];
      
      observations.forEach((obs: LangfuseObservation) => {
        const date = new Date(obs.startTime).toISOString().split('T')[0];
        const dailyStats = dailyStatsMap.get(date);
        
        if (dailyStats) {
          if (obs.name === 'form.update') {
            dailyStats.formUpdates++;
            totalEvents++;
            
            // Contar campos modificados
            const inputField = obs.input?.field;
            if (inputField) {
              fieldCounts.set(inputField, (fieldCounts.get(inputField) || 0) + 1);
            }
          } else if (obs.name === 'copilot.feedback') {
            dailyStats.feedbacks++;
            totalEvents++;
          }
        }
      });
    });

    // Convertir estadísticas diarias a array y ordenar por fecha
    const dailyStats = Array.from(dailyStatsMap.values())
      .sort((a, b) => a.date.localeCompare(b.date));

    // Obtener top 5 campos más modificados
    const topFields = Array.from(fieldCounts.entries())
      .map(([field, count]) => ({ field, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calcular promedio de eventos por visita
    const averageEventsPerVisit = uniquePatients.size > 0 
      ? totalEvents / uniquePatients.size 
      : 0;

    const stats: EMRStats = {
      dailyStats,
      topFields,
      averageEventsPerVisit,
      lastUpdated: new Date().toISOString()
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
} 