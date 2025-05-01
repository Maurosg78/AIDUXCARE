import fs from 'fs';
import path from 'path';
import readline from 'readline';
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
function ask(question) {
    return new Promise(resolve => rl.question(question, resolve));
}
async function main() {
    console.log("🧪 Creador de nueva evaluación AiDuxCare\n");
    const patientName = await ask("Nombre del paciente (e.g. Eva Martínez): ");
    const patientId = await ask("ID del paciente (e.g. eva-martinez-1988): ");
    const visitCount = parseInt(await ask("¿Cuántas visitas deseas simular? "), 10);
    const visits = [];
    for (let i = 0; i < visitCount; i++) {
        console.log(`\n📝 Detalles de la visita ${i + 1}`);
        const visitId = await ask("ID de visita (e.g. v1): ");
        const date = await ask("Fecha (YYYY-MM-DD): ");
        const type = await ask("Tipo (evaluation, follow-up...): ");
        const status = await ask("Estado (completed, scheduled...): ");
        const notes = await ask("Notas breves: ");
        visits.push({ visitId, date, type, status, notes });
    }
    const filename = `eval.${patientId}.ts`;
    const filepath = path.join('evals', 'patient-visits', filename);
    const content = `import VisitService from "@/modules/emr/services/VisitService";

export async function run${camelCase(patientId)}Eval() {
  console.log("\\n🧪 Ejecutando prueba ${patientName}");
  const visits = ${JSON.stringify(visits.map(v => ({
        id: v.visitId,
        patientId,
        visitDate: v.date,
        visitType: v.type,
        status: v.status,
        notes: v.notes,
    })), null, 2)};

  for (const visit of visits) {
    await VisitService.create(visit);
  }

  const found = await VisitService.getByPatientId("${patientId}");
  console.log("Visitas encontradas:", found);

  if (found.length === ${visits.length}) {
    console.log("✅ Test PASÓ: ${patientName} tiene ${visits.length} visita(s) registradas.");
  } else {
    console.error("❌ Test FALLÓ: visitas registradas incorrectas.");
  }
}
`;
    fs.writeFileSync(filepath, content);
    console.log(`\n✅ Evaluación guardada en ${filepath}`);
    rl.close();
}
function camelCase(str) {
    return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase()).replace(/[^a-zA-Z0-9]/g, '');
}
main();
