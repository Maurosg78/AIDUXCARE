// scripts/testVisitAlerts.js

import assert from 'assert';

function validateVisit(visit) {
  const warnings = [];
  if (!visit.visitDate) warnings.push("Falta la fecha de la visita.");
  if (!visit.visitType) warnings.push("Falta el tipo de visita.");
  if (!visit.status) warnings.push("Falta el estado de la visita.");
  return warnings;
}

console.log("🔎 Test de validación de visitas clínicas...");

const cases = [
  {
    input: {},
    expectedWarnings: 3
  },
  {
    input: { visitDate: "2025-01-01" },
    expectedWarnings: 2
  },
  {
    input: { visitDate: "2025-01-01", visitType: "Control", status: "completed" },
    expectedWarnings: 0
  }
];

cases.forEach(({ input, expectedWarnings }, i) => {
  const warnings = validateVisit(input);
  try {
    assert.strictEqual(warnings.length, expectedWarnings);
    console.log(`✅ Caso ${i + 1} pasó (${expectedWarnings} advertencias esperadas)`);
  } catch {
    console.error(`❌ Caso ${i + 1} falló. Advertencias:`, warnings);
    process.exit(1);
  }
});

console.log("🎉 Validación de alertas clínicas completada con éxito.");
