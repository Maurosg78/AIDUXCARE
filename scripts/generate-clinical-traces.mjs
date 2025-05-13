import { langfuse } from './clients/langfuseClient.mjs';

const PACIENTES_MUESTRA = [
  {
    id: 'eva-martinez',
    nombre: 'Eva Martínez',
    edad: 35,
    motivo: 'Control rutinario',
    historial: {
      alergias: ['penicilina'],
      condiciones: ['hipertensión'],
      ultima_visita: '2024-04-01'
    }
  },
  {
    id: 'juan-perez',
    nombre: 'Juan Pérez',
    edad: 45,
    motivo: 'Dolor de espalda crónico',
    historial: {
      alergias: [],
      condiciones: ['lumbalgia crónica', 'obesidad'],
      ultima_visita: '2024-04-15'
    }
  },
  {
    id: 'maria-garcia',
    nombre: 'María García',
    edad: 28,
    motivo: 'Seguimiento tratamiento',
    historial: {
      alergias: ['aspirina'],
      condiciones: ['migraña'],
      ultima_visita: '2024-04-20'
    }
  }
];

const TIPOS_EVALUACION = [
  {
    tipo: 'evaluacion-inicial',
    pasos: [
      {
        nombre: 'revision-historial',
        detalles: ['antecedentes', 'alergias', 'medicamentos-actuales']
      },
      {
        nombre: 'examen-fisico',
        detalles: ['presion-arterial', 'temperatura', 'frecuencia-cardiaca']
      },
      {
        nombre: 'signos-vitales',
        detalles: ['peso', 'altura', 'imc']
      },
      {
        nombre: 'evaluacion-sintomas',
        detalles: ['sintomas-principales', 'duracion', 'intensidad']
      },
      {
        nombre: 'diagnostico-preliminar',
        detalles: ['hallazgos', 'impresion-clinica']
      },
      {
        nombre: 'plan-tratamiento',
        detalles: ['medicamentos', 'recomendaciones', 'seguimiento']
      }
    ]
  },
  {
    tipo: 'seguimiento',
    pasos: [
      {
        nombre: 'revision-evolucion',
        detalles: ['cambios-sintomas', 'efectividad-tratamiento']
      },
      {
        nombre: 'evaluacion-actual',
        detalles: ['estado-actual', 'nuevos-sintomas']
      },
      {
        nombre: 'ajuste-tratamiento',
        detalles: ['cambios-medicacion', 'nuevas-recomendaciones']
      },
      {
        nombre: 'proxima-cita',
        detalles: ['fecha-seguimiento', 'indicaciones-especiales']
      }
    ]
  }
];

function generarDatosMedicos() {
  return {
    presion_arterial: `${110 + Math.floor(Math.random() * 40)}/${70 + Math.floor(Math.random() * 20)}`,
    temperatura: (36 + Math.random()).toFixed(1),
    frecuencia_cardiaca: 60 + Math.floor(Math.random() * 40),
    peso: (50 + Math.random() * 40).toFixed(1),
    altura: (1.5 + Math.random() * 0.5).toFixed(2),
    imc: (20 + Math.random() * 10).toFixed(1)
  };
}

async function generarTraceClinico(paciente, tipoEvaluacion) {
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

  console.log(`📋 Generando evaluación: ${tipoEvaluacion.tipo} para ${paciente.nombre}`);

  const datosMedicos = generarDatosMedicos();
  
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

    // Simular procesamiento del paso
    await new Promise(resolve => setTimeout(resolve, 300));

    // Generar resultado con datos específicos
    const resultado = {
      estado: Math.random() > 0.7 ? 'requiere-atencion' : 
              Math.random() > 0.5 ? 'requiere-seguimiento' : 
              'completado',
      datos_medicos: paso.nombre === 'examen-fisico' ? datosMedicos : undefined,
      hallazgos: [],
      recomendaciones: []
    };

    // Agregar hallazgos específicos según el paso
    if (paso.nombre === 'evaluacion-sintomas') {
      resultado.hallazgos = [
        `Intensidad del dolor: ${Math.floor(Math.random() * 10)}/10`,
        `Duración: ${Math.floor(Math.random() * 30)} días`,
        paciente.motivo
      ];
    }

    if (resultado.estado === 'requiere-atencion') {
      resultado.recomendaciones.push('Requiere atención inmediata');
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

    console.log(`  ✓ ${paso.nombre}: ${resultado.estado}`);
    if (resultado.hallazgos.length > 0) {
      console.log(`    Hallazgos: ${resultado.hallazgos.join(', ')}`);
    }
  }

  return trace;
}

async function generarEvaluacionesClinicas() {
  console.log('🏥 Generando evaluaciones clínicas de muestra...\n');

  try {
    for (const paciente of PACIENTES_MUESTRA) {
      for (const tipoEvaluacion of TIPOS_EVALUACION) {
        await generarTraceClinico(paciente, tipoEvaluacion);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    await langfuse.shutdownAsync();
    
    console.log('\n✅ Generación de evaluaciones completada');
    console.log('\nPor favor, revisa en Langfuse:');
    console.log('1. Ve a https://cloud.langfuse.com');
    console.log('2. Sección "Traces"');
    console.log('3. Filtra por nombre de paciente o tipo de evaluación');

  } catch (error) {
    console.error('\n❌ Error durante la generación:', error);
    process.exit(1);
  }
}

// Ejecutar la generación
generarEvaluacionesClinicas(); 