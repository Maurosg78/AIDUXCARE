"use strict";
const fs = require('fs');
const path = require('path');
const BASE_DIR = '.';
const term = process.argv[2];
if (!term) {
    console.error('❌ Debes especificar un término. Ejemplo: npm run audit:term TODO');
    process.exit(1);
}
const results = [];
function scan(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (fullPath.includes('node_modules') || fullPath.includes('.git') || fullPath.includes('dist')) {
            continue;
        }
        if (entry.name.includes(term)) {
            results.push(`📁 Nombre contiene "${term}": ${fullPath}`);
        }
        if (entry.isDirectory()) {
            scan(fullPath);
        }
        else if (entry.isFile()) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes(term)) {
                results.push(`📄 Contenido contiene "${term}": ${fullPath}`);
            }
        }
    }
}
console.log(`🔎 Buscando referencias a "${term}"...`);
scan(BASE_DIR);
if (results.length > 0) {
    console.log(`\n🚨 Elementos encontrados con "${term}":`);
    results.forEach(r => console.log(r));
}
else {
    console.log(`✅ Proyecto limpio. No se encontraron referencias a "${term}".`);
}
