import { Langfuse } from "langfuse";
import VisitService from "../../src/modules/emr/services/VisitService";
import { PatientVisit } from "../../src/modules/emr/models/PatientVisit";

export async function runMartaPerez1985Eval() {
  console.log("\n🧪 Ejecutando prueba Marta Pérez");

  const langfuse = new Langfuse({
    publicKey: process.env.LANGFUSE_PUBLIC_KEY!,
    secretKey: process.env.LANGFUSE_SECRET_KEY!,
    baseUrl: process.env.LANGFUSE_HOST!,
  });

  const trace = langfuse.trace({
    name: "EVAL - Marta Pérez",
    metadata: { patientId: "marta-perez-1985" },
  });

  // Limpiar visitas previas
  await VisitService.clearAll();

  const visits: PatientVisit[] = [
    {
      id: "mp-v1",
      patientId: "marta-perez-1985",
      visitDate: "2025-05-01T10:00:00Z",
      visitType: "evaluation",
      status: "completed",
      notes: "Primera evaluación inicial",
      motivo: "Dolor lumbar crónico con irradiación a pierna derecha",
      diagnosticoFisioterapeutico: "Lumbalgia crónica con componente radicular L5-S1",
      tratamientoPropuesto: "1. Ejercicios de estabilización lumbar\n2. Terapia manual\n3. Educación postural"
    },
    {
      id: "mp-v2",
      patientId: "marta-perez-1985",
      visitDate: "2025-05-15T11:30:00Z",
      visitType: "follow-up",
      status: "scheduled",
      notes: "Control programado",
      motivo: "Seguimiento lumbalgia",
      diagnosticoFisioterapeutico: "",  // Campo vacío para probar validación
      tratamientoPropuesto: "Continuar con ejercicios domiciliarios"
    },
  ];

  for (const visit of visits) {
    await VisitService.create(visit);
  }

  const found = await VisitService.getByPatientId("marta-perez-1985");
  trace.span({ name: "getByPatientId", input: { patientId: "marta-perez-1985" }, output: found });

  // Evaluación de campos requeridos y omisiones clínicas
  const evaluateVisit = (visit: PatientVisit, index: number) => {
    const issues: string[] = [];

    if (!visit.motivo) {
      issues.push("❌ Motivo de consulta vacío");
    }
    if (!visit.diagnosticoFisioterapeutico) {
      issues.push("❌ Diagnóstico fisioterapéutico vacío");
    }
    if (!visit.tratamientoPropuesto) {
      issues.push("❌ Tratamiento propuesto vacío");
    }

    // Evaluación de omisiones clínicas
    if (visit.motivo?.toLowerCase().includes("dolor") && !visit.diagnosticoFisioterapeutico?.toLowerCase().includes("dolor")) {
      issues.push("⚠️ El diagnóstico no aborda el dolor mencionado en el motivo");
    }

    if (visit.diagnosticoFisioterapeutico?.toLowerCase().includes("lumbar") && !visit.tratamientoPropuesto?.toLowerCase().includes("lumbar")) {
      issues.push("⚠️ El tratamiento no especifica abordaje lumbar mencionado en diagnóstico");
    }

    trace.event({
      name: "eval.visit_check",
      metadata: {
        visitId: visit.id,
        issues
      }
    });

    console.log(`\nEvaluación Visita ${index + 1} (${visit.id}):`);
    if (issues.length === 0) {
      console.log("✅ Todos los criterios cumplidos");
    } else {
      issues.forEach(issue => console.log(issue));
    }
  };

  found.forEach(evaluateVisit);

  if (found.length === 2) {
    console.log("\n✅ Test PASÓ: Marta tiene 2 visitas registradas.");
  } else {
    console.error("\n❌ Test FALLÓ: No se registraron correctamente.");
  }

  await trace.end();
  await langfuse.shutdownAsync();
} 