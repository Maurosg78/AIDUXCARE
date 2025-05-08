import express from 'express';
import cors from 'cors';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const patientsRouter = require('./routes/patients.cjs');

const app = express();
const port = 3555;

app.use(cors());
app.use(express.json());

// Middleware de registro
app.use((req, res, next) => {
  console.log(`🔄 Petición recibida: ${req.method} ${req.url}`);
  next();
});

// Ruta básica de salud
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Configurar rutas
app.use('/api/patients', patientsRouter);

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Servidor ESM directo corriendo en http://localhost:${port}`);
}); 