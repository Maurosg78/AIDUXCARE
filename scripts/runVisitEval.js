const { VisitService } = require('./visitService.bridge');
const fs = require('fs');

const evals = JSON.parse(fs.readFileSync('evals/patient-visits/eval_patient_visits.json', 'utf-8'));

console.log('🧪 Ejecutando pruebas de visitas clínicas...\n');

let passed = 0;
let failed = 0;

evals.forEach((test, index) => {
  const visit = test.input;
  const expectations = test.expectedOutput;

  VisitService.clearAll();
  VisitService.create(visit);

  const saved = !!VisitService.getByVisitId(visit.id);
  const foundInList = VisitService.getByPatientId(visit.patientId).some(v => v.id === visit.id);
  const validationWarning = visit.diagnosis.trim() === '';

  const success =
    saved === expectations.saved &&
    foundInList === expectations.retrievableByPatientId &&
    (expectations.validationWarning === undefined || validationWarning === expectations.validationWarning);

  if (success) {
    console.log(`✅ [${index + 1}] ${test.description}`);
    passed++;
  } else {
    console.log(`❌ [${index + 1}] ${test.description}`);
    failed++;
  }
});

console.log(`\n🎯 Resultado: ${passed} pasaron, ${failed} fallaron.`);

