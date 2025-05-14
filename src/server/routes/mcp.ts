import { Router } from 'express';
import { z } from 'zod';
import VisitService from "@/core/services/visit/VisitService.js";
import { trackEvent } from '../../core/lib/langfuse.client';

const router = Router();

// Schema para validar el cuerpo de la petición
const RequestSchema = z.object({
  user_input: z.string(),
  visit_metadata: z.object({
    visit_id: z.string(),
    date: z.string().datetime(),
    professional: z.string().email()
  }),
  system_instructions: z.string()
});

router.post('/invoke', async (req, res) => {
  try {
    // Validar el cuerpo de la petición
    const validatedData = RequestSchema.parse(req.body);
    const visit_id = validatedData.visit_metadata.visit_id;

    // Mostrar información de depuración
    console.log('\n🔍 Depuración MCP:');
    console.log('Cuerpo de la petición:', JSON.stringify(req.body, null, 2));
    console.log('Visit ID recibido:', visit_id);
    
    const allVisits = await VisitService.getAllVisits();
    console.log('Visitas disponibles:', allVisits.map(v => ({id: v.id, reason: v.reason})));

    // Verificar si la visita existe
    const visitExists = allVisits.some(v => v.id === visit_id);
    if (!visitExists) {
      console.log('❌ Visita no encontrada');
      
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

    console.log('✅ Visita encontrada');

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
