import { NextApiRequest, NextApiResponse } from 'next';
import { trackEvent } from '@/core/services/langfuseClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const feedback = req.body;

    // Registrar el evento en Langfuse
    await trackEvent({
      name: 'feedback_submitted',
      payload: {
        intuitiveness: feedback.intuitiveness,
        voiceInput: feedback.voiceInput,
        aiSuggestions: feedback.aiSuggestions,
        security: feedback.security,
        hasFutureFeatures: !!feedback.futureFeatures,
        hasAdditionalComments: !!feedback.additionalComments,
      }
    });

    // Aquí podrías guardar el feedback en una base de datos
    // Por ahora solo devolvemos éxito
    return res.status(200).json({ message: 'Feedback recibido correctamente' });
  } catch (error) {
    console.error('Error al procesar feedback:', error);
    return res.status(500).json({ message: 'Error al procesar el feedback' });
  }
} 