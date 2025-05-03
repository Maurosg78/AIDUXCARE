import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/config/auth';
import { Langfuse } from 'langfuse-node';

const langfuse = new Langfuse({
  publicKey: process.env.VITE_LANGFUSE_PUBLIC_KEY || '',
  secretKey: process.env.VITE_LANGFUSE_SECRET_KEY || '',
  baseUrl: process.env.VITE_LANGFUSE_HOST,
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.isAdmin) {
    return res.status(403).json({ error: 'No autorizado' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Obtener eventos de los últimos 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const traces = await langfuse.getTraces({
      startDate: thirtyDaysAgo,
      endDate: new Date(),
      tags: ['copilot'],
    });

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

    // Procesar eventos
    for (const trace of traces) {
      const events = await langfuse.getTraceEvents(trace.id);
      
      for (const event of events) {
        if (event.name === 'copilot.suggestion.generated') {
          metrics.totalSuggestions++;
          
          const fields = event.metadata?.suggestedFields as string[] || [];
          fields.forEach(field => {
            if (!metrics.suggestionsByField[field]) {
              metrics.suggestionsByField[field] = {
                total: 0,
                accepted: 0,
                feedback: {
                  positive: 0,
                  negative: 0,
                  ignored: 0,
                },
              };
            }
            metrics.suggestionsByField[field].total++;
          });
        }
        
        if (event.name === 'copilot.suggestion.feedback') {
          const feedback = event.metadata?.feedback as string;
          const field = event.metadata?.field as string;
          
          if (feedback && field) {
            metrics.feedbackByType[feedback as keyof typeof metrics.feedbackByType]++;
            
            if (metrics.suggestionsByField[field]) {
              metrics.suggestionsByField[field].feedback[feedback as keyof typeof metrics.feedbackByType]++;
            }
          }
        }
        
        if (event.name === 'copilot.suggestion.accepted') {
          metrics.acceptedSuggestions++;
          const field = event.metadata?.field as string;
          
          if (field && metrics.suggestionsByField[field]) {
            metrics.suggestionsByField[field].accepted++;
          }
        }
      }

      // Agregar a topPatients si hay sugerencias
      const patientId = trace.metadata?.patientId as string;
      if (patientId) {
        const patientIndex = metrics.topPatients.findIndex(p => p.patientId === patientId);
        if (patientIndex === -1) {
          metrics.topPatients.push({
            patientId,
            suggestions: 1,
            accepted: 0,
            lastInteraction: trace.timestamp,
          });
        } else {
          metrics.topPatients[patientIndex].suggestions++;
          if (trace.timestamp > metrics.topPatients[patientIndex].lastInteraction) {
            metrics.topPatients[patientIndex].lastInteraction = trace.timestamp;
          }
        }
      }
    }

    // Ordenar pacientes por número de sugerencias
    metrics.topPatients.sort((a, b) => b.suggestions - a.suggestions);
    metrics.topPatients = metrics.topPatients.slice(0, 10); // Top 10

    res.status(200).json(metrics);
  } catch (error) {
    console.error('Error al obtener métricas del copiloto:', error);
    res.status(500).json({ error: 'Error al obtener métricas' });
  }
} 