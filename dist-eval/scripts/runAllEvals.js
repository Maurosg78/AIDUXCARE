import { runPatientVisitEval } from '../evals/patient-visits/eval.patient-visits.js';
async function runAll() {
    console.log("🧪 Iniciando evaluación completa de AiDuxCare\n");
    await runPatientVisitEval();
    console.log("\n✅ Todas las evaluaciones completadas correctamente.");
}
runAll();
