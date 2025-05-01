import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Definir __dirname en ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Interfaz para los datos base de cada paciente
interface PatientTemplate {
  id: string;
  name: string;
  birthYear: number;
  diagnosis: string;
  caseType: string;
}

// Plantillas base de pacientes - agregar nuevos pacientes aquí
const templates: PatientTemplate[] = [
  {
    id: 'javier-ruiz-1966',
    name: 'Javier Ruiz',
    birthYear: 1966,
    diagnosis: 'Postoperatorio de prótesis total de cadera',
    caseType: 'postoperatorio'
  },
  {
    id: 'lucia-gomez-1982',
    name: 'Lucía Gómez',
    birthYear: 1982,
    diagnosis: 'Esclerosis Lateral Amiotrófica',
    caseType: 'diagnóstico'
  },
  {
    id: 'carla-ortega-2018',
    name: 'Carla Ortega',
    birthYear: 2018,
    diagnosis: 'Dolor lumbar persistente post caída',
    caseType: 'trauma'
  }
];

// Función para generar la estructura de evaluación
function generateEvalData(template: PatientTemplate) {
  const visitDate = new Date().toISOString();
  return {
    patientId: template.id,
    visitDate,
    motivo: template.caseType,
    observaciones: `Paciente ${template.name}, nacido en ${template.birthYear}, con diagnóstico de ${template.diagnosis}.`,
    exploracionFisica: {
      inspeccion: 'Inspección general del paciente',
      movilidad: 'Rango de movimiento evaluado',
      hallazgos: []
    },
    escalasUtilizadas: ['Escala Visual Analógica (VAS)'],
    diagnostico: template.diagnosis,
    plan: 'Plan de tratamiento genérico: seguimiento y revisiones periódicas',
    alertas: ['Alerta: falta prueba complementaria recomendada']
  };
}

// Directorio destino de los JSON
const outputDir = path.resolve(__dirname, '../evals/patient-visits');

// Asegurarse de que existe el directorio
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generar archivos para cada plantilla
templates.forEach(template => {
  const data = generateEvalData(template);
  const fileName = `${template.id}.json`;
  const filePath = path.join(outputDir, fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`✅ Archivo generado: ${fileName}`);
});

console.log('🎉 Generación de evals completada'); 