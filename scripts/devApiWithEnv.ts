import express from 'express';
import cors from 'cors';
import { resolve } from 'path';
import dotenv from 'dotenv';
import { Console } from 'console';

// Configurar console para debugging
const console = new Console(process.stdout, process.stderr);

// Cargar variables de entorno
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// Inicializar servidor
const app = express();
const port = 3000;

// Configurar middleware
app.use(cors());
app.use(express.json());

// Ruta básica para verificar que el servidor está funcionando
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'AiDuxCare API v1.15-dev',
    timestamp: new Date().toISOString()
  });
});

// Rutas simuladas para pacientes
app.get('/api/patients', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 'mock-1', name: 'Patient 1', age: 45 },
      { id: 'mock-2', name: 'Patient 2', age: 62 }
    ]
  });
});

app.post('/api/patients', (req, res) => {
  console.log('📝 Recibida solicitud para crear paciente:', req.body);
  res.status(201).json({
    success: true,
    data: {
      id: 'mock-' + Date.now(),
      ...req.body,
      created_at: new Date().toISOString()
    }
  });
});

// Rutas simuladas para logs de auditoría
app.get('/api/visits/:id/audit-log', (req, res) => {
  const visitId = req.params.id;
  console.log(`🔍 Solicitando logs para visita ${visitId}`);
  
  res.json({
    success: true,
    data: [
      {
        id: 'mock-1',
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
});

app.post('/api/visits/:id/audit-log', (req, res) => {
  const visitId = req.params.id;
  console.log('📝 Registrando evento de auditoría:', {
    visit_id: visitId,
    ...req.body,
    timestamp: new Date().toISOString()
  });
  
  res.status(201).json({
    success: true,
    message: 'Evento registrado correctamente',
    data: {
      id: 'mock-' + Math.random().toString(36).substring(2, 9),
      visit_id: visitId,
      ...req.body,
      timestamp: new Date().toISOString()
    }
  });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Dev API Server corriendo en http://localhost:${port}`);
  console.log('📡 Endpoints disponibles:');
  console.log('   - GET/POST /api/patients');
  console.log('   - GET/POST /api/visits/:id/audit-log');
}); 