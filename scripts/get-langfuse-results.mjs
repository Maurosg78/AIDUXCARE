import { langfuse } from './clients/langfuseClient.mjs';
import axios from 'axios';

async function getRecentTraces() {
  console.log('📊 Obteniendo resultados recientes de Langfuse...\n');

  const auth = Buffer.from(`${langfuse.publicKey}:${langfuse.secretKey}`).toString('base64');

  try {
    const response = await axios.get('https://cloud.langfuse.com/api/public/traces', {
      headers: {
        'Authorization': `Basic ${auth}`
      },
      params: {
        limit: 10,
        orderByDirection: 'DESC',
        orderBy: 'timestamp'
      }
    });

    const traces = response.data.traces;
    
    if (!traces || traces.length === 0) {
      console.log('No se encontraron traces recientes.');
      return;
    }

    console.log('Traces encontrados:\n');
    traces.forEach(trace => {
      console.log(`🔍 Trace: ${trace.name}`);
      console.log(`   ID: ${trace.id}`);
      console.log(`   Estado: ${trace.status || 'pendiente'}`);
      console.log(`   Timestamp: ${new Date(trace.timestamp).toLocaleString()}`);
      if (trace.metadata) {
        console.log('   Metadata:', JSON.stringify(trace.metadata, null, 2));
      }
      
      // Mostrar spans si existen
      if (trace.spans && trace.spans.length > 0) {
        console.log('   Spans:');
        trace.spans.forEach(span => {
          console.log(`     - ${span.name} (${span.status || 'completado'})`);
          if (span.input) console.log(`       Input: ${JSON.stringify(span.input)}`);
          if (span.output) console.log(`       Output: ${JSON.stringify(span.output)}`);
        });
      }
      
      console.log(''); // Línea en blanco para separar
    });

  } catch (error) {
    console.error('❌ Error al obtener los traces:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.error('\nParece que hay un problema con la autenticación. Verifica tus credenciales de Langfuse.');
    }
    process.exit(1);
  }
}

// Ejecutar la consulta
getRecentTraces(); 