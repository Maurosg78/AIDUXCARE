import { runEvaMartinezEval } from './eval.eva-martinez.js';

console.log('🏥 Iniciando evaluaciones de pacientes...\n');

try {
  await runEvaMartinezEval();
  console.log('\n✅ Todas las evaluaciones completadas con éxito');
} catch (error) {
  console.error('\n❌ Error durante las evaluaciones:', error);
  process.exit(1);
} 