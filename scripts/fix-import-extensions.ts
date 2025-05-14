import { Project } from "ts-morph";
import path from "path";

const project = new Project({
  tsConfigFilePath: "tsconfig.routes.json",
});

const files = project.getSourceFiles();

for (const file of files) {
  const imports = file.getImportDeclarations();

  for (const imp of imports) {
    const moduleSpecifier = imp.getModuleSpecifierValue();

    // Solo modificar imports relativos sin extensión
    if (
      moduleSpecifier.startsWith(".") &&
      !moduleSpecifier.endsWith(".ts") &&
      !moduleSpecifier.endsWith(".js") &&
      !moduleSpecifier.endsWith(".json")
    ) {
      const resolved = imp.getModuleSpecifierSourceFile();
      if (resolved) {
        const ext = path.extname(resolved.getFilePath());
        imp.setModuleSpecifier(`${moduleSpecifier}${ext}`);
      }
    }
  }

  file.saveSync();
}

console.log("✅ Corrección de imports completada.");

