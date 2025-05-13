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
      const result = await new Promise((resolve, reject) => {
        const child = spawn('node', [testPath], { stdio: 'pipe' });
        
        let output = '';
        child.stdout.on('data', (data) => {
          output += data;
        });
        
        let error = '';
        child.stderr.on('data', (data) => {
          error += data;
        });
        
        child.on('close', (code) => {
          if (code === 0) {
            resolve({ success: true, output });
          } else {
            reject({ success: false, error: error || output });
          }
        });
      });
      
      process.stdout.write(" ✅ PASÓ\n");
      
      // Mostrar detalles en formato resumido
      const lines = result.output.split('\n');
      for (const line of lines) {
        if (line.includes('✅')) {
          console.log(`   └─ ${line.trim()}`);
        }
      }
      console.log();
    } catch (error) {
      process.stdout.write(" ❌ FALLÓ\n");
      console.error(`   └─ Error: ${error.error}\n`);
      process.exit(1);
    }
  }
  
  console.log("✨ Todos los tests pasaron correctamente.");
  console.log("🚀 El sistema AIDUXCARE está listo para su uso.");
}

runTests(); 