import express from 'express';
import cors from 'cors';
import { createRequire } from 'module';
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import process from 'process';
import { Console } from 'console';

// Configurar console global
const console = new Console(process.stdout, process.stderr);

// Configurar __dirname para ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: resolve(__dirname, '.env.local') });

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Middleware para debugging
app.use((req, res, next) => {
  console.log(`🔄 Petición recibida: ${req.method} ${req.url}`);
  next();
});

// Importar router de patients
const require = createRequire(import.meta.url);
const patientsRouter = require('./routes/patients.cjs');

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Configurar rutas
app.use('/api/patients', patientsRouter);

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 API ESM server corriendo en http://localhost:${port}`);
}); 