import { runPatientVisitEval } from '../evals/patient-visits/eval.patient-visits.js';
import { runEvaMartinezEval } from '../evals/patient-visits/eval.eva-martinez.js';

async function runAll() {
  console.log("🧪 Iniciando evaluación completa de AiDuxCare\n");

  await runPatientVisitEval();
  await runEvaMartinezEval();

  console.log("\n✅ Todas las evaluaciones completadas correctamente.");
}

runAll();
