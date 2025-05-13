import VisitService from "../src/modules/emr/services/VisitService";
import fs from "fs";

const evals = JSON.parse(fs.readFileSync('evals/patient-visits/eval_patient_visits.json', 'utf-8'));

console.log('🧪 Ejecutando pruebas de visitas clínicas...\n');

let passed = 0;
let failed = 0;

for (const [index, test] of evals.entries()) {
  const visit = test.input;
  const visits = await VisitService.getByPatientId(visit.patientId);
  const foundInList = visits.some((v: any) => v.id === visit.id);
  const expectations = test.expectedOutput;

  VisitService.clearAll();
  VisitService.create(visit);

  const saved = !!VisitService.getByVisitId(visit.id);
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

console.log(`\n🎯 Resultado: ${passed} pasaron, ${failed} fallaron.`);
}
