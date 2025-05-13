#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import { Console } from 'console';
import process from 'process';

// Configuración global
const console = new Console(process.stdout, process.stderr);
const app = express();
const port = 3000;

// Manejo de excepciones para evitar terminación abrupta
process.on('uncaughtException', (err) => {
  console.error('Error no capturado:', err);
  // No terminar el proceso
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no manejada:', reason);
  // No terminar el proceso
});

// Manejadores de señales del sistema
process.on('SIGINT', () => {
  console.log('\n📌 Señal SIGINT recibida. Cerrando servidor...');
  server.close(() => {
    console.log('🔒 Servidor cerrado correctamente');
    process.exit(0);
  });
  // Si no cierra en 2 segundos, forzar salida
  setTimeout(() => {
    console.log('⚠️ Forzando cierre...');
    process.exit(1);
  }, 2000);
});

process.on('SIGTERM', () => {
  console.log('\n📌 Señal SIGTERM recibida. Cerrando servidor...');
  server.close(() => {
    console.log('🔒 Servidor cerrado correctamente');
    process.exit(0);
  });
});

console.log('🚀 Iniciando servidor independiente v1.15...');

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*',  // Permitir cualquier origen para desarrollo
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Base de datos en memoria con datos iniciales
const mockPatients = [
  { id: 'pat-001', nombre: 'Juan Pérez', edad: 45, email: 'juan@example.com' },
  { id: 'pat-002', nombre: 'María López', edad: 38, email: 'maria@example.com' },
  { id: 'pat-003', nombre: 'Carlos Rodríguez', edad: 52, email: 'carlos@example.com' }
];

const auditLogs = {};

// RUTAS API PACIENTES
app.get('/api/patients', (req, res) => {
  try {
    console.log('🧪 GET /api/patients');
    res.json({ success: true, data: mockPatients });
  } catch (error) {
    console.error('Error en GET /api/patients:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

app.get('/api/patients/:id', (req, res) => {
  try {
    const patient = mockPatients.find(p => p.id === req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Paciente no encontrado' });
    }
    res.json({ success: true, data: patient });
  } catch (error) {
    console.error(`Error en GET /api/patients/${req.params.id}:`, error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

app.post('/api/patients', (req, res) => {
  try {
    console.log('🧪 POST /api/patients');
    const newPatient = {
      id: 'pat-' + Date.now(),
      ...req.body
    };
    mockPatients.push(newPatient);
    res.status(201).json({ success: true, data: newPatient });
  } catch (error) {
    console.error('Error en POST /api/patients:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// RUTAS AUDITORÍA DE VISITAS
app.get('/api/visits/:id/audit-log', (req, res) => {
  try {
    const visitId = req.params.id;
    
    // Si no hay logs para esta visita, devolver array vacío
    const logs = auditLogs[visitId] || [];
    
    if (logs.length === 0) {
      // Si no hay logs, generar uno de ejemplo
      const mockLog = {
        id: `log-${Date.now()}`,
        visit_id: visitId,
        timestamp: new Date().toISOString(),
        action: 'field_updated',
        field: 'motivo',
        old_value: 'Consulta inicial',
        new_value: 'Dolor de cabeza',
        modified_by: 'doctor@example.com',
        source: 'user'
      };
      logs.push(mockLog);
      auditLogs[visitId] = logs;
    }
    
    console.log(`🧪 GET /api/visits/${visitId}/audit-log`);
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error(`Error en GET /api/visits/${req.params.id}/audit-log:`, error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

app.post('/api/visits/:id/audit-log', (req, res) => {
  try {
    const visitId = req.params.id;
    
    // Inicializar array de logs si no existe
    if (!auditLogs[visitId]) {
      auditLogs[visitId] = [];
    }
    
    // Crear el nuevo log
    const newLog = {
      id: `log-${Date.now()}`,
      visit_id: visitId,
      timestamp: new Date().toISOString(),
      ...req.body
    };
    
    // Guardar el log
    auditLogs[visitId].push(newLog);
    
    console.log('📝 Registrando evento de auditoría:', newLog);
    
    res.status(201).json({
      success: true,
      message: 'Evento registrado correctamente',
      data: newLog
    });
  } catch (error) {
    console.error(`Error en POST /api/visits/${req.params.id}/audit-log:`, error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

// RUTA DE VERIFICACIÓN DE ESTADO - HEALTH CHECK
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Ruta de inicio para verificar funcionamiento
app.get('/', (req, res) => {
  res.json({ 
    message: 'Servidor simple v1.15 funcionando',
    endpoints: {
      patients: '/api/patients',
      'patient-detail': '/api/patients/:id',
      'visit-audit-logs': '/api/visits/:id/audit-log',
      'health': '/health'
    },
    version: '1.15.0',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
const server = app.listen(port, () => {
  console.log(`🚀 Servidor simple v1.15 corriendo en http://localhost:${port}`);
  console.log('📡 API endpoints disponibles:');
  console.log('   - GET/POST /api/patients');
  console.log('   - GET/POST /api/visits/:id/audit-log');
  console.log('   - GET /health (verificación de estado)');
});

// Mantener el proceso vivo
process.stdin.resume();

console.log('⚠️ Para detener el servidor, presiona Ctrl+C'); 