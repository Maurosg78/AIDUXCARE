import { langfuse } from './clients/langfuseClient.mjs';

const PACIENTES_EXTENDIDOS = [
  {
    id: 'carlos-rodriguez',
    nombre: 'Carlos Rodríguez',
    edad: 52,
    motivo: 'Control diabetes',
    historial: {
      alergias: ['sulfas'],
      condiciones: ['diabetes tipo 2', 'hipertensión', 'obesidad'],
      ultima_visita: '2024-03-15',
      medicamentos_actuales: ['metformina', 'losartán']
    }
  },
  {
    id: 'ana-silva',
    nombre: 'Ana Silva',
    edad: 31,
    motivo: 'Embarazo de alto riesgo',
    historial: {
      alergias: [],
      condiciones: ['gestación 28 semanas', 'hipotiroidismo'],
      ultima_visita: '2024-04-10',
      medicamentos_actuales: ['levotiroxina', 'ácido fólico']
    }
  },
  {
    id: 'roberto-gomez',
    nombre: 'Roberto Gómez',
    edad: 68,
    motivo: 'Post operatorio bypass',
    historial: {
      alergias: ['yodo'],
      condiciones: ['enfermedad coronaria', 'artritis'],
      ultima_visita: '2024-04-18',
      medicamentos_actuales: ['warfarina', 'atorvastatina']
    }
  }
];

const TIPOS_EVALUACION_EXTENDIDOS = [
  {
    tipo: 'evaluacion-especializada',
    pasos: [
      {
        nombre: 'revision-historial-detallada',
        detalles: ['antecedentes-familiares', 'historial-quirurgico', 'medicamentos-actuales']
      },
      {
        nombre: 'examen-especializado',
        detalles: ['signos-vitales-completos', 'examenes-especificos-condicion']
      },
      {
        nombre: 'evaluacion-riesgo',
        detalles: ['factores-riesgo', 'complicaciones-potenciales']
      },
      {
        nombre: 'plan-tratamiento-especializado',
        detalles: ['ajustes-medicacion', 'intervenciones-especializadas', 'metas-tratamiento']
      }
    ]
  },
  {
    tipo: 'evaluacion-emergencia',
    pasos: [
      {
        nombre: 'triage',
        detalles: ['nivel-urgencia', 'sintomas-criticos']
      },
      {
        nombre: 'evaluacion-rapida',
        detalles: ['abc-vital', 'estabilidad-hemodinamica']
      },
      {
        nombre: 'intervencion-inmediata',
        detalles: ['medidas-emergencia', 'medicacion-urgente']
      }
    ]
  }
];

function generarDatosMedicosExtendidos(tipo) {
  const base = {
    presion_arterial: `${110 + Math.floor(Math.random() * 40)}/${70 + Math.floor(Math.random() * 20)}`,
    temperatura: (36 + Math.random()).toFixed(1),
    frecuencia_cardiaca: 60 + Math.floor(Math.random() * 40),
    saturacion_o2: (95 + Math.random() * 5).toFixed(1),
    frecuencia_respiratoria: 12 + Math.floor(Math.random() * 8)
  };

  if (tipo === 'evaluacion-especializada') {
    return {
      ...base,
      glucosa: (80 + Math.random() * 120).toFixed(1),
      colesterol: (150 + Math.random() * 100).toFixed(1),
      creatinina: (0.6 + Math.random() * 0.8).toFixed(2)
    };
  }

  return base;
}

async function generarTraceClinicoExtendido(paciente, tipoEvaluacion) {
  const trace = langfuse.trace({
    id: `${paciente.id}-${tipoEvaluacion.tipo}-${Date.now()}`,
    name: tipoEvaluacion.tipo,
    userId: paciente.id,
    metadata: {
      paciente: {
        ...paciente,
        historial: paciente.historial
      },
      tipo_evaluacion: tipoEvaluacion.tipo,
      fecha: new Date().toISOString()
    }
  });

  console.log(`📋 Generando evaluación extendida: ${tipoEvaluacion.tipo} para ${paciente.nombre}`);

  const datosMedicos = generarDatosMedicosExtendidos(tipoEvaluacion.tipo);
  
  for (const paso of tipoEvaluacion.pasos) {
    const span = trace.span({
      name: paso.nombre,
      input: {
        paciente_id: paciente.id,
        paso: paso.nombre,
        detalles_requeridos: paso.detalles,
        timestamp_inicio: new Date().toISOString()
      }
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    const resultado = {
      estado: determinarEstado(paciente, paso),
      datos_medicos: paso.nombre.includes('examen') ? datosMedicos : undefined,
      hallazgos: generarHallazgos(paciente, paso),
      recomendaciones: [],
      nivel_riesgo: calcularNivelRiesgo(paciente, datosMedicos)
    };

    if (resultado.estado === 'requiere-atencion') {
      resultado.recomendaciones.push(
        'Requiere atención inmediata',
        'Consulta con especialista requerida',
        'Monitoreo continuo recomendado'
      );
    }

    span.end({
      output: {
        ...resultado,
        timestamp_fin: new Date().toISOString()
      },
      level: resultado.estado === 'requiere-atencion' ? 'ERROR' : 
             resultado.estado === 'requiere-seguimiento' ? 'WARNING' : 
             'INFO'
    });

    console.log(`  ✓ ${paso.nombre}: ${resultado.estado} (Riesgo: ${resultado.nivel_riesgo})`);
    if (resultado.hallazgos.length > 0) {
      console.log(`    Hallazgos: ${resultado.hallazgos.join(', ')}`);
    }
  }

  return trace;
}

function determinarEstado(paciente, paso) {
  const condicionesCriticas = ['diabetes tipo 2', 'enfermedad coronaria', 'embarazo de alto riesgo'];
  const tieneCondicionCritica = paciente.historial.condiciones.some(c => condicionesCriticas.includes(c));
  
  if (tieneCondicionCritica && Math.random() > 0.6) {
    return 'requiere-atencion';
  }
  if (Math.random() > 0.7) {
    return 'requiere-seguimiento';
  }
  return 'completado';
}

function generarHallazgos(paciente, paso) {
  const hallazgos = [];
  
  if (paso.nombre === 'evaluacion-riesgo') {
    paciente.historial.condiciones.forEach(condicion => {
      hallazgos.push(`Riesgo asociado a ${condicion}`);
    });
  }

  if (paso.nombre === 'triage') {
    hallazgos.push(`Prioridad: ${Math.random() > 0.7 ? 'ALTA' : 'MEDIA'}`);
  }

  return hallazgos;
}

function calcularNivelRiesgo(paciente, datosMedicos) {
  let puntos = 0;
  
  // Factores de edad
  if (paciente.edad > 65) puntos += 2;
  if (paciente.edad > 80) puntos += 1;
  
  // Factores de condiciones
  puntos += paciente.historial.condiciones.length;
  
  // Factores de signos vitales
  if (datosMedicos) {
    const pas = parseInt(datosMedicos.presion_arterial.split('/')[0]);
    if (pas > 140) puntos += 2;
    if (pas > 160) puntos += 1;
    
    if (datosMedicos.saturacion_o2 < 95) puntos += 2;
  }
  
  if (puntos <= 2) return 'BAJO';
  if (puntos <= 5) return 'MEDIO';
  return 'ALTO';
}

async function generarEvaluacionesClinicasExtendidas() {
  console.log('🏥 Generando evaluaciones clínicas extendidas...\n');

  try {
    for (const paciente of PACIENTES_EXTENDIDOS) {
      for (const tipoEvaluacion of TIPOS_EVALUACION_EXTENDIDOS) {
        await generarTraceClinicoExtendido(paciente, tipoEvaluacion);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    await langfuse.shutdownAsync();
    
    console.log('\n✅ Generación de evaluaciones extendidas completada');
    console.log('\nRevisa los resultados en Langfuse:');
    console.log('1. https://cloud.langfuse.com');
    console.log('2. Sección "Traces"');
    console.log('3. Filtra por "evaluacion-especializada" o "evaluacion-emergencia"');

  } catch (error) {
    console.error('\n❌ Error durante la generación:', error);
    process.exit(1);
  }
}

generarEvaluacionesClinicasExtendidas(); 