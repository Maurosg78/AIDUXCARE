import { Langfuse } from 'langfuse';
import dotenv from 'dotenv';

dotenv.config();

const LANGFUSE_HOST = 'https://cloud.langfuse.com';
const LANGFUSE_PUBLIC_KEY = 'pk-lf-57c6e2ec-8603-44cf-b030-cddcef1f1f3d';
const LANGFUSE_SECRET_KEY = 'sk-lf-c1872960-86af-4899-b275-b7de8d536794';
const PROJECT_ID = 'cma5fncph00uyad070wfdjna6';

const langfuse = new Langfuse({
  publicKey: LANGFUSE_PUBLIC_KEY,
  secretKey: LANGFUSE_SECRET_KEY,
  baseUrl: LANGFUSE_HOST,
});

async function getRecentEvents(eventType?: string) {
  try {
    const response = await langfuse.fetchObservations({
      name: eventType,
      limit: 10
    });

    return response.data || [];
  } catch (error) {
    console.error(`Error obteniendo eventos ${eventType || 'todos'}:`, error);
    return [];
  }
}

async function main() {
  console.log('Consultando eventos recientes de Langfuse...\n');
  console.log(`Host: ${LANGFUSE_HOST}`);
  console.log(`Project ID: ${PROJECT_ID}\n`);

  // Obtener todos los eventos
  console.log('=== Todos los eventos recientes ===');
  const allEvents = await getRecentEvents();
  
  // Agrupar eventos por tipo
  const eventsByType = allEvents.reduce((acc: Record<string, any[]>, event: any) => {
    const type = event.name || 'sin_nombre';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(event);
    return acc;
  }, {});

  // Mostrar eventos por tipo
  Object.entries(eventsByType).forEach(([type, events]) => {
    console.log(`\nTipo: ${type}`);
    console.log(`Cantidad: ${events.length}`);
    events.forEach((event: any) => {
      console.log(`\nTrace ID: ${event.traceId}`);
      console.log(`Timestamp: ${new Date(event.timestamp).toLocaleString()}`);
      console.log('Metadata:', JSON.stringify(event.metadata, null, 2));
      console.log('---');
    });
  });

  // Cerrar el cliente
  await langfuse.shutdownAsync();
}

main().catch(console.error); 