import { langfuse } from './clients/langfuseClient.js';

async function testLangfuseConnection() {
  console.log('🧪 Probando conexión con Langfuse...');
  
  try {
    // Crear un trace de prueba
    const trace = langfuse.trace({
      name: "test-connection",
      metadata: {
        test: true,
        timestamp: new Date().toISOString()
      }
    });

    // Crear un span de prueba
    const span = trace.span({
      name: "test-operation",
      input: { test: "data" }
    });

    // Simular una operación
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Finalizar el span
    span.end({
      output: { result: "success" }
    });

    console.log('✅ Conexión con Langfuse establecida correctamente');
    console.log('Trace ID:', trace.id);

  } catch (error) {
    console.error('❌ Error al conectar con Langfuse:', error);
    process.exit(1);
  }
}

// Ejecutar la prueba
testLangfuseConnection(); 