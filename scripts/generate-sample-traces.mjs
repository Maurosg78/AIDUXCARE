import { langfuse } from './clients/langfuseClient.mjs';

async function generateSampleTraces() {
  console.log('🧪 Generando traces de muestra...\n');

  const traceTypes = [
    {
      name: 'patient-evaluation',
      events: ['initial-check', 'vital-signs', 'diagnosis', 'prescription'],
      possibleStatuses: ['success', 'warning', 'error']
    },
    {
      name: 'medical-report',
      events: ['gather-data', 'analyze', 'generate-report', 'review'],
      possibleStatuses: ['success', 'error']
    },
    {
      name: 'treatment-plan',
      events: ['review-history', 'create-plan', 'schedule-followup'],
      possibleStatuses: ['success', 'pending', 'error']
    }
  ];

  try {
    for (const traceType of traceTypes) {
      // Generar 2 traces por tipo
      for (let i = 0; i < 2; i++) {
        const trace = langfuse.trace({
          id: `${traceType.name}-${Date.now()}-${i}`,
          name: traceType.name,
          userId: 'test-user',
          metadata: {
            environment: 'development',
            version: '1.0.0',
            iteration: i
          }
        });

        console.log(`📝 Creando trace: ${trace.id}`);

        // Generar spans para cada evento
        for (const event of traceType.events) {
          const status = traceType.possibleStatuses[
            Math.floor(Math.random() * traceType.possibleStatuses.length)
          ];

          const span = trace.span({
            name: event,
            input: { 
              type: event,
              timestamp: new Date().toISOString()
            }
          });

          // Simular procesamiento
          await new Promise(resolve => setTimeout(resolve, 200));

          span.end({
            output: { 
              status,
              completedAt: new Date().toISOString()
            },
            level: status === 'error' ? 'ERROR' : 'INFO'
          });
        }

        // Esperar entre traces
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Esperar a que todos los datos se envíen
    await langfuse.shutdownAsync();
    
    console.log('\n✅ Generación de traces completada');
    console.log('\nPor favor:');
    console.log('1. Ve a https://cloud.langfuse.com');
    console.log('2. Ve a la sección "Traces"');
    console.log('3. Deberías ver los nuevos traces generados');

  } catch (error) {
    console.error('\n❌ Error durante la generación:', error);
    process.exit(1);
  }
}

// Ejecutar la generación
generateSampleTraces(); 