import { Router } from 'express';
import { z } from 'zod';
import { trackEvent } from '../../../core/lib/langfuse.client';
import { visitExists } from '../../../core/services/VisitService';

const router = Router();

// Schema para validar el cuerpo de la petición
const RequestSchema = z.object({
  visit_id: z.string().uuid(),
  timestamp: z.string().datetime()
});

router.post('/invoke', async (req, res) => {
  try {
    // Validar el cuerpo de la petición
    const { visit_id } = RequestSchema.parse(req.body);

    // Verificar si la visita existe
    if (!visitExists(visit_id)) {
      await trackEvent('mcp_error', {
        reason: 'invalid_visit_id',
        visit_id,
        timestamp: new Date().toISOString()
      });

      return res.status(404).json({
        success: false,
        error: 'Visita no encontrada',
        code: 'VISIT_NOT_FOUND'
      });
    }

    // Registrar el evento de invocación exitosa
    await trackEvent('mcp_invoke', {
      visit_id,
      timestamp: new Date().toISOString()
    });

    // Por ahora solo devolvemos OK
    res.status(200).json({
      success: true,
      message: 'Contexto MCP validado correctamente'
    });
  } catch (error) {
    console.error('Error en /api/mcp/invoke:', error);

    // Registrar el error
    await trackEvent('mcp_error', {
      reason: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    });

    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      code: 'VALIDATION_ERROR'
    });
  }
});

export default router; 