import { runPatientVisitEval } from '../evals/patient-visits/eval.patient-visits.js';
import { runEvaMartinezEval } from '../evals/patient-visits/eval.eva-martinez.js';
import { runMartaPerez1985Eval } from '../evals/patient-visits/eval.marta-perez-1985.js';
console.log("\n🧪 Iniciando evaluación completa de AiDuxCare\n\n");
await runPatientVisitEval();
await runEvaMartinezEval();
await runMartaPerez1985Eval();
console.log("\n✅ Todas las evaluaciones completadas correctamente.");
