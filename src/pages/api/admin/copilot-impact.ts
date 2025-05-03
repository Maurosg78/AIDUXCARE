import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../core/config/auth';
import { Langfuse } from 'langfuse-node';
import { UserRole } from '../../../modules/auth/authService';

const langfuse = new Langfuse({
  publicKey: process.env.VITE_LANGFUSE_PUBLIC_KEY ?? '',
  secretKey: process.env.VITE_LANGFUSE_SECRET_KEY ?? '',
  baseUrl: process.env.VITE_LANGFUSE_HOST ?? 'https://cloud.langfuse.com',
});

interface CopilotImpactMetrics {
  totalSuggestions: number;
  acceptedSuggestions: number;
  feedbackByType: {
    positive: number;
    negative: number;
    ignored: number;
  };
  suggestionsByField: {
    [key: string]: {
      total: number;
      accepted: number;
      feedback: {
        positive: number;
        negative: number;
        ignored: number;
      };
    };
  };
  topPatients: Array<{
    patientId: string;
    suggestions: number;
    accepted: number;
    lastInteraction: string;
  }>;
  lastUpdated: string;
}

type FeedbackType = 'positive' | 'negative' | 'ignored';

// Función auxiliar para procesar eventos de sugerencias
const processSuggestionEvents = (events: any[]) => {
  const metrics: CopilotImpactMetrics = {
    totalSuggestions: 0,
    acceptedSuggestions: 0,
    feedbackByType: {
      positive: 0,
      negative: 0,
      ignored: 0,
    },
    suggestionsByField: {},
    topPatients: [],
    lastUpdated: new Date().toISOString(),
  };

  const patientStats = new Map<string, {
    suggestions: number;
    accepted: number;
    lastInteraction: string;
  }>();

  events.forEach(event => {
    if (event.name === 'copilot.suggestion') {
      metrics.totalSuggestions++;
      const field = event.input?.field;
      if (field) {
        if (!metrics.suggestionsByField[field]) {
          metrics.suggestionsByField[field] = {
            total: 0,
            accepted: 0,
            feedback: { positive: 0, negative: 0, ignored: 0 },
          };
        }
        metrics.suggestionsByField[field].total++;
      }
    } else if (event.name === 'copilot.feedback') {
      const feedbackType = event.input?.feedback as FeedbackType;
      if (feedbackType && feedbackType in metrics.feedbackByType) {
        metrics.feedbackByType[feedbackType]++;
        if (feedbackType === 'positive') {
          metrics.acceptedSuggestions++;
          const field = event.input?.field;
          if (field && metrics.suggestionsByField[field]) {
            metrics.suggestionsByField[field].accepted++;
            metrics.suggestionsByField[field].feedback.positive++;
          }
        }
      }
    }

    // Actualizar estadísticas por paciente
    const patientId = event.metadata?.patientId;
    if (patientId) {
      const stats = patientStats.get(patientId) || {
        suggestions: 0,
        accepted: 0,
        lastInteraction: event.startTime,
      };

      if (event.name === 'copilot.suggestion') {
        stats.suggestions++;
      } else if (event.name === 'copilot.feedback' && event.input?.feedback === 'positive') {
        stats.accepted++;
      }

      if (new Date(event.startTime) > new Date(stats.lastInteraction)) {
        stats.lastInteraction = event.startTime;
      }

      patientStats.set(patientId, stats);
    }
  });

  // Convertir estadísticas de pacientes a array y ordenar
  metrics.topPatients = Array.from(patientStats.entries())
    .map(([patientId, stats]) => ({
      patientId,
      ...stats,
    }))
    .sort((a, b) => b.suggestions - a.suggestions)
    .slice(0, 10);

  return metrics;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user || (session.user as { role?: UserRole }).role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado' });
    }

    // Obtener eventos de los últimos 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const response = await langfuse.fetchObservations({
      toStartTime: thirtyDaysAgo,
      name: 'copilot.suggestion',
    });

    const feedbackResponse = await langfuse.fetchObservations({
      toStartTime: thirtyDaysAgo,
      name: 'copilot.feedback',
    });

    const allEvents = [...(response.data || []), ...(feedbackResponse.data || [])];
    const metrics = processSuggestionEvents(allEvents);

    res.status(200).json(metrics);
  } catch (error) {
    console.error('Error al obtener métricas del copiloto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
} 