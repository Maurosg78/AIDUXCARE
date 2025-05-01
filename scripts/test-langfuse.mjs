import { langfuse } from './clients/langfuseClient.mjs';

async function testLangfuseConnection() {
  console.log('🧪 Probando conexión con Langfuse...');
  
  try {
    // Crear un trace de prueba
    const trace = langfuse.trace({
      name: "test-connection",
      metadata: {
        test: true,
        timestamp: new Date().toISOString(),
        environment: "development",
        project: "AiDuxCare"
      },
      userId: "test-user",
      tags: ["test", "setup"]
    });

    // Crear un span de prueba
    const span = trace.span({
      name: "test-operation",
      input: { 
        test: "data",
        timestamp: new Date().toISOString()
      }
    });

    // Simular una operación
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Finalizar el span con resultado
    span.end({
      output: { 
        result: "success",
        message: "Conexión establecida correctamente"
      }
    });

    console.log('✅ Conexión con Langfuse establecida correctamente');
    console.log('Trace ID:', trace.id);
    console.log('\nPor favor, verifica en la interfaz de Langfuse:');
    console.log('1. Ve a la sección "Tracing" → "Traces"');
    console.log('2. Haz clic en "Configure Tracing" si es la primera vez');
    console.log('3. Espera unos segundos y refresca la página si es necesario');
    console.log(`4. Busca el trace con ID: ${trace.id}`);

  } catch (error) {
    console.error('❌ Error al conectar con Langfuse:', error);
    process.exit(1);
  }
}

// Ejecutar la prueba
testLangfuseConnection(); 