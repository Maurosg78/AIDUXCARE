import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { resolve } from 'path';
import mcpRouter from './src/server/routes/mcp';
import { langfuseServer, mockLangfuseEvent, isServerEnvValid } from './src/core/lib/langfuse.config';

// Cargar variables de entorno
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// Validar entorno del servidor
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

// Endpoint para eventos de Langfuse
app.post('/api/event', async (req, res) => {
  try {
    const { name, ...metadata } = req.body as { name: string; [key: string]: unknown };

    // En desarrollo, permitir modo mock si Langfuse no está configurado
    if (!langfuseServer) {
      await mockLangfuseEvent(name, metadata);
      res.status(200).json({ 
        message: 'Evento simulado (Langfuse no configurado)',
        mock: true,
        environment: process.env.NODE_ENV
      });
      return;
    }

    await langfuseServer.event(name, metadata);
    res.status(200).json({ message: 'Evento registrado' });
  } catch (error) {
    console.error('Error en /api/event:', error);
    res.status(500).json({ 
      message: 'Error al procesar evento',
      error: error instanceof Error ? error.message : 'Error desconocido',
      environment: process.env.NODE_ENV
    });
  }
});

// Rutas
app.use('/api/mcp', mcpRouter);

// Iniciar servidor
app.listen(port, () => {
  console.log('\n🔄 Inicializando servidor...');
  
  // Mostrar estado de la configuración
  if (process.env.NODE_ENV === 'development') {
    console.log('\n📝 Estado de la configuración:');
    console.log('  - NODE_ENV:', process.env.NODE_ENV);
    console.log('  - Langfuse:', langfuseServer ? '✅ Configurado' : '⚠️  Modo Mock');
    if (!isValid) {
      console.warn('\n⚠️  Advertencias de configuración:');
      errors.forEach(error => console.warn(`  ${error}`));
    }
  }
  
  console.log(`\n🚀 API server corriendo en http://localhost:${port}`);
}); 