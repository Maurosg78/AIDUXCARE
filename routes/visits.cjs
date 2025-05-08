const express = require('express');
const router = express.Router();

console.log('⚙️ Visits API Router cargado');

// Middleware para verificar ID de visita
const validateVisitId = (req, res, next) => {
  const visitId = req.params.id;
  // Verificar si el formato es válido (simular UUID)
  if (!visitId || !visitId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) {
    return res.status(400).json({ 
      success: false, 
      message: 'ID de visita inválido'
    });
  }
  next();
};

// GET /api/visits/:id/audit-log - Obtener logs de auditoría para una visita
router.get('/:id/audit-log', validateVisitId, (req, res) => {
  try {
    const visitId = req.params.id;
    
    // Como solución temporal, simplemente devolvemos datos de prueba
    // En producción, esto se conectaría a Supabase
    res.json({
      success: true,
      message: 'Endpoint funcionando correctamente',
      data: [
        {
          id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          visit_id: visitId,
          timestamp: new Date().toISOString(),
          action: 'field_updated',
          field: 'motivo',
          old_value: 'Consulta general',
          new_value: 'Dolor lumbar',
          modified_by: 'doctor@example.com',
          source: 'user'
        }
      ]
    });
  } catch (error) {
    console.error('Error al obtener logs de auditoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener logs de auditoría',
      error: error.message
    });
  }
});

// POST /api/visits/:id/audit-log - Registrar nuevo evento de auditoría
router.post('/:id/audit-log', validateVisitId, express.json(), (req, res) => {
  try {
    const visitId = req.params.id;
    const eventData = req.body;
    
    // Validar datos mínimos
    if (!eventData || !eventData.action || !eventData.field || !eventData.modifiedBy || !eventData.source) {
      return res.status(400).json({
        success: false,
        message: 'Datos incompletos para el registro de auditoría'
      });
    }
    
    // En producción, guardaría en Supabase, por ahora solo simular
    console.log('📝 Registrando evento de auditoría:', {
      visit_id: visitId,
      ...eventData,
      timestamp: new Date().toISOString()
    });
    
    res.status(201).json({
      success: true,
      message: 'Evento de auditoría registrado correctamente',
      data: {
        id: 'test-' + Math.random().toString(36).substring(2, 9),
        visit_id: visitId,
        ...eventData,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error al registrar evento de auditoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar evento de auditoría',
      error: error.message
    });
  }
});

// Exportación del router
module.exports = router; 