import { langfuse } from './clients/langfuseClient.mjs';

async function runCompleteTest() {
  console.log('🧪 Iniciando prueba completa de Langfuse...\n');

  try {
    // 1. Crear un trace principal
    const mainTrace = langfuse.trace({
      id: 'test-' + Date.now(),
      name: 'complete-test',
      userId: 'test-user',
      metadata: {
        environment: 'development',
        version: '1.0.0'
      }
    });

    console.log('📝 Trace principal creado:', mainTrace.id);

    // 2. Crear y ejecutar varios spans
    const spans = [];
    
    // Span 1: Operación básica
    const span1 = mainTrace.span({
      name: 'basic-operation',
      input: { type: 'test', data: 'initial data' }
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    span1.end({
      output: { status: 'success', result: 'operation completed' }
    });
    spans.push(span1);

    // Span 2: Operación con error
    const span2 = mainTrace.span({
      name: 'error-operation',
      input: { type: 'test', data: 'error simulation' }
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    span2.end({
      output: { status: 'error', message: 'simulated error' },
      level: 'ERROR'
    });
    spans.push(span2);

    // Span 3: Operación exitosa
    const span3 = mainTrace.span({
      name: 'success-operation',
      input: { type: 'test', data: 'final operation' }
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    span3.end({
      output: { status: 'success', data: 'final result' }
    });
    spans.push(span3);

    // 3. Finalizar el trace principal
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\n✅ Prueba completada exitosamente');
    console.log('ID del Trace:', mainTrace.id);
    console.log('\nPor favor:');
    console.log('1. Ve a https://cloud.langfuse.com');
    console.log('2. Selecciona el proyecto "AiDuxCare-Evals"');
    console.log('3. Ve a la sección "Traces"');
    console.log('4. Deberías ver el trace con ID:', mainTrace.id);
    
    // Esperar a que todos los datos se envíen
    await langfuse.shutdownAsync();

  } catch (error) {
    console.error('\n❌ Error durante la prueba:', error);
    process.exit(1);
  }
}

// Ejecutar la prueba
runCompleteTest(); 