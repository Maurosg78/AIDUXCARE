import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import patientRoutes from './server/routes/api/patient';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rutas de la API
app.use('/api/patient', patientRoutes);

// Carga dinámica de la ruta de patients
console.log('🧩 Cargando manualmente patientsRoutes'); 
let patientsRoutes;
(async () => {
  const module = await import(path.resolve('src/server/routes/emr/patients'));
  patientsRoutes = module.default;
  app.use('/api/patients', patientsRoutes);
})();

// Página de inicio de la API
app.get('/', (req, res) => {
  res.json({
    message: 'AiDuxCare API v1.8.0',
    endpoints: ['/api/patient', '/api/patients'],
    status: 'online'
  });
});

app.listen(port, () => {
  console.log(`🚀 API server corriendo en http://localhost:${port}`);
  console.log(`📡 Endpoints disponibles: /api/patient, /api/patients`);
});

// Ruta inline para pacientes (sin dependencias externas)
console.log('🛠️ Inline route /api/patients cargada');
app.get('/api/patients', async (req, res) => {
  // aquí podrías llamar a patientService, pero de momento devolvemos mock
  res.json({ success: true, message: 'Ruta inline activa', data: [] });
});
