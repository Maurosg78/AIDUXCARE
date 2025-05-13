import express from 'express';
import cors from 'cors';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const patientsRouter = require('./routes/patients.cjs');

const app = express();
const port = 3444;

app.use(cors());
app.use(express.json());

// Middleware para debug
app.use((req, res, next) => {
  console.log(`🔍 ${req.method} ${req.path}`);
  next();
});

// Usar el router
app.use('/api/patients', patientsRouter);

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Servidor ESM de prueba corriendo en http://localhost:${port}`);
}); 