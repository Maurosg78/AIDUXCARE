import fs from "fs";
import path from "path";

const rootDir = path.resolve("src");
const aliasFixes: Record<string, string> = {
  '../services/VisitService': '@/core/services/visit/VisitService',
  '../lib/supabaseClient': '@/core/lib/supabaseClient',
  '../lib/langfuse.client': '@/core/lib/langfuse.client',
  '../services/PatientService': '@/core/services/patient/PatientService',
};

function walk(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) return [fullPath];
    return [];
  });
}

function fixImports(filePath: string) {
  let content = fs.readFileSync(filePath, "utf-8");
  let modified = false;

  for (const [brokenPath, fixedPath] of Object.entries(aliasFixes)) {
    if (content.includes(brokenPath)) {
      content = content.replaceAll(brokenPath, fixedPath);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`✅ Fix applied: ${filePath}`);
  }
}

function main() {
  const files = walk(rootDir);
  files.forEach(fixImports);
  console.log("🧹 Revisión de imports completada.");
}

main();
