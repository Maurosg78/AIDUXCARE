import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { createRequire } from 'module';
import { langfuseServer, mockLangfuseEvent, isServerEnvValid } from './src/core/lib/langfuse.config';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const { isValid, errors } = isServerEnvValid();
if (!isValid && process.env.NODE_ENV !== 'development') {
  console.error('\n❌ Error en la configuración del servidor:');
  errors.forEach(error => console.error(`  ${error}`));
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Middleware de registro para depuración
app.use((req, res, next) => {
  console.log(`🔄 Petición recibida: ${req.method} ${req.url}`);
  next();
});

// Importar el router utilizando createRequire
const require = createRequire(import.meta.url);
const patientsRouter = require('./routes/patients.cjs');
console.log('🔧 Tipo de patientsRouter:', typeof patientsRouter);

// Crear una ruta básica para comprobar el servidor
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Configurar rutas
app.use('/api/patients', patientsRouter);

app.post('/api/log-event', async (req, res) => {
  try {
    const { name, ...metadata } = req.body as { name: string; [key: string]: unknown };
    if (langfuseServer) {
      await langfuseServer.trace({ name, metadata });
    } else {
      mockLangfuseEvent(name, metadata);
    }
    res.status(200).json({ message: 'Evento registrado' });
  } catch (error: unknown) {
    console.error('❌ Error al registrar evento:', error);
    res.status(500).json({ message: 'Error al registrar evento', error: error instanceof Error ? error.message : 'Error desconocido' });
  }
});

if (process.env.NODE_ENV === 'development') {
  console.log('\n📝 Estado del entorno:');
  console.log('  - NODE_ENV:', process.env.NODE_ENV);
  console.log('  - Langfuse:', langfuseServer ? '✅ Configurado' : '⚠️  Modo Mock');
  if (!isValid) {
    console.warn('\n⚠️  Advertencias de configuración:');
    errors.forEach(error => console.warn(`  ${error}`));
  }
}

// 🚀 Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 API server corriendo en http://localhost:${port}`);
});

