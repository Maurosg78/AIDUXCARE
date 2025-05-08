import express from 'express';
import { Console } from 'console';
import process from 'process';
import cors from 'cors';

// Configurar console global
const console = new Console(process.stdout, process.stderr);

const app = express();
const port = 3000;

// Configurar middleware para procesar JSON
app.use(express.json());
app.use(cors());

// Mock API pacientes directamente integrado
const patientsRouter = express.Router();

// Mock de pacientes
const mockPatients = [
  { id: 'pat-001', nombre: 'Juan Pérez', edad: 45, email: 'juan@example.com' },
  { id: 'pat-002', nombre: 'María López', edad: 38, email: 'maria@example.com' }
];

patientsRouter.get('/', (req, res) => {
  console.log('🧪 JS route /api/patients activated');
  res.json({ success: true, data: mockPatients });
});

patientsRouter.post('/', (req, res) => {
  const newPatient = {
    id: 'pat-' + Date.now(),
    ...req.body
  };
  mockPatients.push(newPatient);
  res.status(201).json({ success: true, data: newPatient });
});

// Mock API visits/audit-log
const visitsRouter = express.Router();

visitsRouter.get('/:id/audit-log', (req, res) => {
  const visitId = req.params.id;
  res.json({
    success: true,
    data: [
      {
        id: `log-${Date.now()}`,
        visit_id: visitId,
        timestamp: new Date().toISOString(),
        action: 'field_updated',
        field: 'motivo',
        old_value: 'Consulta inicial',
        new_value: 'Dolor de cabeza',
        modified_by: 'doctor@example.com',
        source: 'user'
      }
    ]
  });
});

visitsRouter.post('/:id/audit-log', (req, res) => {
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
      id: `log-${Date.now()}`,
      visit_id: visitId,
      ...req.body,
      timestamp: new Date().toISOString()
    }
  });
});

// Registrar routers
app.use('/api/patients', patientsRouter);
app.use('/api/visits', visitsRouter);

// Ruta básica para probar
app.get('/', (req, res) => {
  res.json({ 
    message: 'Servidor simple funcionando',
    endpoints: {
      patients: '/api/patients',
      visits: '/api/visits/:id/audit-log'
    }
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`🚀 Servidor simple corriendo en http://localhost:${port}`);
  console.log('📡 API endpoints disponibles:');
  console.log('   - GET/POST /api/patients');
  console.log('   - GET/POST /api/visits/:id/audit-log');
}); 