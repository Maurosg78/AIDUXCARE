const VisitService = require('../dist/modules/emr/services/VisitService.js');

const testVisit = {
  id: 'v-test-structured',
  patientId: 'p-test-structured',
  visitDate: '2025-05-01',
  visitType: 'Control',
  status: 'completed',
  anamnesis: 'Dolor lumbar agudo tras levantar peso.',
  physicalExam: 'Limitación en flexión lumbar, dolor a la palpación paravertebral.',
  diagnosis: 'Lumbalgia mecánica aguda.',
  treatmentPlan: 'Aplicación de calor, estiramientos suaves y reposo relativo.',
  notes: 'Paciente refiere estrés laboral elevado.'
};

(async () => {
  try {
    await VisitService.create(testVisit);
    const visitas = await VisitService.getByPatientId(testVisit.patientId);
    const encontrada = visitas.find(v => v.id === testVisit.id);

    if (encontrada) {
      console.log("✅ Eval estructurada PASÓ: Visita con estructura completa registrada.");
    } else {
      console.error("❌ No se encontró la visita estructurada en la base.");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error en evaluación estructurada:", error);
    process.exit(1);
  }
})();

