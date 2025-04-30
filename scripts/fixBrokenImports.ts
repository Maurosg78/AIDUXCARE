import fs from "fs";
import path from "path";

const BASE_DIR: string = './src';
const TARGET: string = 'Maple';
const REPLACEMENT: string = 'AiDuxCare';

function scanAndFixImports(dir: string): void {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      scanAndFixImports(fullPath);
    } else if (entry.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx'))) {
      fixImportsInFile(fullPath);
    }
  }
}

function fixImportsInFile(filePath: string): void {
  let content: string = fs.readFileSync(filePath, 'utf8');
  let original: string = content;

  // Busca importaciones o requires con "Maple" en la ruta
  const regex = /from\s+['"](.*Maple.*)['"]|require\(['"](.*Maple.*)['"]\)/g;
  content = content.replace(regex, (match) => match.replace(new RegExp(TARGET, 'g'), REPLACEMENT));

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`🔧 Imports corregidos en: ${filePath}`);
  }
}

console.log('🛠️ Corrigiendo imports rotos con referencias a "Maple"...');
scanAndFixImports(BASE_DIR);
console.log('✅ Corrección completada.');
