import { NextApiRequest, NextApiResponse } from 'next';
import { Langfuse } from 'langfuse-node';

const langfuse = new Langfuse({
  publicKey: process.env.VITE_LANGFUSE_PUBLIC_KEY || '',
  secretKey: process.env.VITE_LANGFUSE_SECRET_KEY || '',
  baseUrl: process.env.VITE_LANGFUSE_HOST || 'https://cloud.langfuse.com'
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Obtener todos los traces
    const traces = await langfuse.getTraces({
      limit: 1000, // Ajustar según necesidad
    });

    // Agrupar por patientId
    const patientActivity = traces.data.reduce((acc: any, trace) => {
      const patientId = trace.metadata?.patientId;
      if (!patientId) return acc;

      if (!acc[patientId]) {
        acc[patientId] = {
          patientId,
          patientName: trace.metadata?.patientName || 'Sin nombre',
          lastUpdateDate: null,
          totalFieldsUpdated: 0,
          feedbackCount: 0
        };
      }

      // Contar eventos form.update
      const formUpdates = trace.observations?.filter(obs => 
        obs.name === 'form.update'
      ) || [];

      if (formUpdates.length > 0) {
        const lastUpdate = formUpdates[formUpdates.length - 1];
        const updateDate = new Date(lastUpdate.startTime);
        
        if (!acc[patientId].lastUpdateDate || updateDate > new Date(acc[patientId].lastUpdateDate)) {
          acc[patientId].lastUpdateDate = updateDate.toISOString();
        }
        
        acc[patientId].totalFieldsUpdated += formUpdates.length;
      }

      // Contar eventos copilot.feedback
      const feedbacks = trace.observations?.filter(obs => 
        obs.name === 'copilot.feedback'
      ) || [];
      
      acc[patientId].feedbackCount += feedbacks.length;

      return acc;
    }, {});

    // Convertir a array y ordenar por última fecha de actualización
    const activityArray = Object.values(patientActivity).sort((a: any, b: any) => {
      if (!a.lastUpdateDate) return 1;
      if (!b.lastUpdateDate) return -1;
      return new Date(b.lastUpdateDate).getTime() - new Date(a.lastUpdateDate).getTime();
    });

    res.status(200).json(activityArray);
  } catch (error) {
    console.error('Error al obtener actividad de pacientes:', error);
    res.status(500).json({ error: 'Error al obtener datos de actividad' });
  }
} 