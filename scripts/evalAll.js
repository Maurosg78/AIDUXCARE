import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const tests = [
  { name: "Servicio de pacientes", file: "evalPatients.js" },
  { name: "Servicio de visitas", file: "evalVisits.js" },
  { name: "Integración pacientes-visitas", file: "evalIntegration.js" },
];

console.log("🔍 Iniciando evaluación completa del sistema AIDUXCARE\n");

async function runTests() {
  for (const test of tests) {
    process.stdout.write(`⏳ Ejecutando test: ${test.name}...`);

    try {
      const testPath = path.join(__dirname, test.file);
      await new Promise((resolve, reject) => {
        const child = spawn("node", [testPath], { stdio: "inherit" });

        child.on("close", (code) => {
          if (code === 0) {
            console.log(" ✅ OK");
            resolve();
          } else {
            reject(`Test ${test.name} falló con código ${code}`);
          }
        });
      });
    } catch (error) {
      console.log(" ❌ FALLÓ");
      console.error(`   └─ Error: ${error}`);
      process.exit(1);
    }
  }

  console.log("\n✨ Todos los tests pasaron correctamente.");
  console.log("🚀 El sistema AIDUXCARE está listo para su uso.");
}

runTests();
