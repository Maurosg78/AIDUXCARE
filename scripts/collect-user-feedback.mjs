import { langfuse } from './clients/langfuseClient.mjs';

async function registrarFeedback(evaluacionId, feedback) {
  try {
    // Crear un nuevo trace para el feedback
    const feedbackTrace = langfuse.trace({
      id: `feedback-${evaluacionId}-${Date.now()}`,
      name: 'feedback-usuario',
      userId: evaluacionId.split('-')[0], // Extraer el ID del paciente
      metadata: {
        evaluacion_id: evaluacionId,
        timestamp: new Date().toISOString()
      }
    });
    
    // Crear un span para el feedback
    const feedbackSpan = feedbackTrace.span({
      name: 'evaluacion-feedback',
      input: {
        tipo_feedback: feedback.tipo,
        calificacion: feedback.calificacion,
        comentarios: feedback.comentarios
      }
    });

    // Agregar tags basados en la calificación
    const tags = [];
    if (feedback.calificacion <= 2) tags.push('requiere-mejora');
    if (feedback.calificacion >= 4) tags.push('experiencia-positiva');
    if (feedback.tipo === 'precision') tags.push('precision-diagnostico');
    if (feedback.tipo === 'usabilidad') tags.push('experiencia-usuario');

    // Finalizar el span con el resultado
    feedbackSpan.end({
      output: {
        tags,
        procesado: true,
        requiere_accion: feedback.calificacion <= 2
      },
      level: feedback.calificacion <= 2 ? 'WARNING' : 'INFO'
    });

    console.log(`✅ Feedback registrado para evaluación ${evaluacionId}`);
    return true;
  } catch (error) {
    console.error(`❌ Error al registrar feedback:`, error);
    return false;
  }
}

// Ejemplo de uso del sistema de feedback
const ejemplosFeedback = [
  {
    evaluacionId: 'carlos-rodriguez-evaluacion-especializada-1234567890',
    feedback: {
      tipo: 'precision',
      calificacion: 4,
      comentarios: 'Evaluación precisa y completa. Recomendaciones útiles.'
    }
  },
  {
    evaluacionId: 'ana-silva-evaluacion-emergencia-1234567890',
    feedback: {
      tipo: 'usabilidad',
      calificacion: 3,
      comentarios: 'El proceso fue un poco lento. Podría ser más ágil.'
    }
  },
  {
    evaluacionId: 'roberto-gomez-evaluacion-especializada-1234567890',
    feedback: {
      tipo: 'precision',
      calificacion: 2,
      comentarios: 'No se consideraron todos los síntomas reportados.'
    }
  }
];

async function procesarEjemplosFeedback() {
  console.log('📝 Procesando ejemplos de feedback...\n');

  for (const ejemplo of ejemplosFeedback) {
    console.log(`Procesando feedback para evaluación: ${ejemplo.evaluacionId}`);
    const resultado = await registrarFeedback(ejemplo.evaluacionId, ejemplo.feedback);
    
    if (resultado) {
      console.log(`  Tipo: ${ejemplo.feedback.tipo}`);
      console.log(`  Calificación: ${ejemplo.feedback.calificacion}/5`);
      console.log(`  Comentarios: ${ejemplo.feedback.comentarios}\n`);
    }
  }

  await langfuse.shutdownAsync();
}

// Ejecutar el procesamiento de ejemplos
procesarEjemplosFeedback(); 