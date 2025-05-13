#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '../../');
const AUDIT_LOG_PATH = path.join(__dirname, '../audit-log/ts-any-usage.json');

function auditTypes() {
  console.log('🔍 Iniciando auditoría de tipos...\n');

  // Crear directorio de logs si no existe
  if (!fs.existsSync(path.dirname(AUDIT_LOG_PATH))) {
    fs.mkdirSync(path.dirname(AUDIT_LOG_PATH), { recursive: true });
  }

  // Buscar todos los usos de 'as any' y '@ts-ignore'
  const anyUsages = findAnyUsages(ROOT_DIR);
  const tsIgnoreUsages = findTsIgnoreUsages(ROOT_DIR);

  // Clasificar los usos
  const classifiedUsages = classifyUsages([...anyUsages, ...tsIgnoreUsages]);

  // Generar reporte
  const report = {
    timestamp: new Date().toISOString(),
    totalUsages: classifiedUsages.length,
    byCategory: {
      temporal: classifiedUsages.filter(u => u.category === 'temporal').length,
      necesario: classifiedUsages.filter(u => u.category === 'necesario').length,
      evitable: classifiedUsages.filter(u => u.category === 'evitable').length
    },
    usages: classifiedUsages
  };

  // Guardar reporte
  fs.writeFileSync(AUDIT_LOG_PATH, JSON.stringify(report, null, 2));

  // Mostrar resumen
  console.log('\n📊 Resumen de la auditoría:');
  console.log(`Total de usos: ${report.totalUsages}`);
  console.log(`⚠️ Temporales: ${report.byCategory.temporal}`);
  console.log(`✅ Necesarios: ${report.byCategory.necesario}`);
  console.log(`🚫 Evitables: ${report.byCategory.evitable}`);
  console.log(`\nReporte completo guardado en: ${AUDIT_LOG_PATH}`);
}

function findAnyUsages(dir) {
  const results = [];
  try {
    const output = execSync(`grep -r "as any" --include="*.ts" --include="*.tsx" ${dir}`).toString();
    output.split('\n').forEach(line => {
      if (line.trim()) {
        const [file, ...rest] = line.split(':');
        const content = rest.join(':').trim();
        results.push({
          type: 'as any',
          file: path.relative(ROOT_DIR, file),
          line: content,
          category: 'pendiente'
        });
      }
    });
  } catch (error) {
    // grep retorna 1 si no encuentra coincidencias
    if (error.status !== 1) {
      console.error('Error al buscar usos de "as any":', error);
    }
  }
  return results;
}

function findTsIgnoreUsages(dir) {
  const results = [];
  try {
    const output = execSync(`grep -r "@ts-ignore" --include="*.ts" --include="*.tsx" ${dir}`).toString();
    output.split('\n').forEach(line => {
      if (line.trim()) {
        const [file, ...rest] = line.split(':');
        const content = rest.join(':').trim();
        results.push({
          type: '@ts-ignore',
          file: path.relative(ROOT_DIR, file),
          line: content,
          category: 'pendiente'
        });
      }
    });
  } catch (error) {
    if (error.status !== 1) {
      console.error('Error al buscar usos de "@ts-ignore":', error);
    }
  }
  return results;
}

function classifyUsages(usages) {
  // Aquí se implementaría la lógica de clasificación
  // Por ahora, marcamos todos como 'evitable' para revisión manual
  return usages.map(usage => ({
    ...usage,
    category: 'evitable'
  }));
}

auditTypes(); 