import { langfuse } from './clients/langfuseClient.mjs';

async function analizarTraces() {
  console.log('📊 Analizando traces clínicos...\n');

  try {
    // Crear un nuevo trace para el análisis
    const analyzeTrace = langfuse.trace({
      name: 'analisis-traces',
      metadata: {
        fecha: new Date().toISOString()
      }
    });

    // Simular resultados de análisis
    const resultados = {
      total_evaluaciones: 6, // 3 pacientes x 2 tipos de evaluación
      por_tipo: {
        'evaluacion-especializada': 3,
        'evaluacion-emergencia': 3
      },
      por_estado: {
        'requiere-atencion': 5,
        'requiere-seguimiento': 3,
        'completado': 10
      },
      por_nivel_riesgo: {
        'ALTO': 4,
        'MEDIO': 12,
        'BAJO': 2
      },
      pacientes_criticos: new Set(['carlos-rodriguez', 'roberto-gomez']),
      tiempo_promedio: 2500 // ms
    };

    // Generar reporte
    console.log('📑 REPORTE DE ANÁLISIS\n');
    console.log(`Total de evaluaciones: ${resultados.total_evaluaciones}`);
    
    console.log('\nDistribución por tipo:');
    Object.entries(resultados.por_tipo).forEach(([tipo, cantidad]) => {
      console.log(`  ${tipo}: ${cantidad}`);
    });

    console.log('\nDistribución por estado:');
    Object.entries(resultados.por_estado).forEach(([estado, cantidad]) => {
      console.log(`  ${estado}: ${cantidad}`);
    });

    console.log('\nDistribución por nivel de riesgo:');
    Object.entries(resultados.por_nivel_riesgo).forEach(([nivel, cantidad]) => {
      console.log(`  ${nivel}: ${cantidad}`);
    });

    console.log(`\nPacientes que requieren atención inmediata: ${resultados.pacientes_criticos.size}`);
    console.log(`Tiempo promedio de evaluación: ${(resultados.tiempo_promedio / 1000).toFixed(2)} segundos`);

    // Generar recomendaciones
    console.log('\n🔍 RECOMENDACIONES');
    
    const porcentajeAtencion = (resultados.por_estado['requiere-atencion'] / resultados.total_evaluaciones) * 100;
    if (porcentajeAtencion > 20) {
      console.log('⚠️  Alto porcentaje de casos que requieren atención inmediata');
      console.log('   - Considerar aumentar personal médico disponible');
      console.log('   - Revisar criterios de clasificación de riesgo');
    }

    const porcentajeRiesgoAlto = (resultados.por_nivel_riesgo['ALTO'] / resultados.total_evaluaciones) * 100;
    if (porcentajeRiesgoAlto > 30) {
      console.log('⚠️  Alta proporción de casos de riesgo elevado');
      console.log('   - Implementar medidas preventivas adicionales');
      console.log('   - Evaluar factores de riesgo comunes');
    }

    // Registrar resultados del análisis
    const resultadosSpan = analyzeTrace.span({
      name: 'resultados-analisis',
      input: resultados
    });

    resultadosSpan.end({
      output: {
        recomendaciones: {
          requiere_atencion_inmediata: porcentajeAtencion > 20,
          riesgo_elevado: porcentajeRiesgoAlto > 30
        }
      }
    });

    await langfuse.shutdownAsync();

  } catch (error) {
    console.error('\n❌ Error durante el análisis:', error);
    process.exit(1);
  }
}

analizarTraces(); 