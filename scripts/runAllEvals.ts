import { runPatientVisitEval } from '../evals/patient-visits/eval.patient-visits.js';
import { runEvaMartinezEval } from '../evals/patient-visits/eval.eva-martinez.js';
import { runMartaPerez1985Eval } from '../evals/patient-visits/eval.marta-perez-1985.js';
import { runNuriaArnedoEval } from '../evals/patient-visits/eval.nuria-arnedo.ts';

console.log("\n🧪 Iniciando evaluación completa de AiDuxCare\n\n");

await runPatientVisitEval();
await runEvaMartinezEval();
await runMartaPerez1985Eval();
await runNuriaArnedoEval();

console.log("\n✅ Todas las evaluaciones completadas correctamente.");
