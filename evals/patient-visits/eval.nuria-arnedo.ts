import 'dotenv/config';
import { Langfuse } from "langfuse";
import VisitService from "../../src/modules/emr/services/VisitService";
import { PatientVisit } from "../../src/modules/emr/models/PatientVisit";

export async function runNuriaArnedoEval() {
  const langfuse = new Langfuse({
    publicKey: process.env.LANGFUSE_PUBLIC_KEY!,
    secretKey: process.env.LANGFUSE_SECRET_KEY!,
    baseUrl: process.env.LANGFUSE_HOST!,
  });

  const trace = langfuse.trace({
    name: "EVAL - Nuria Arnedo",
    metadata: { patientId: "nuria-arnedo-1990" },
  });

  const patientId = "nuria-arnedo-1990";

  // Limpiar visitas previas
  await VisitService.clearAll();

  const visit1: PatientVisit = {
    id: "nuria-visita-001",
    patientId,
    visitDate: new Date("2025-05-01T08:00:00Z").toISOString(),
    visitType: "initial",
    status: "completed",
    notes: "Dolor irradiado en brazo izquierdo, no puede elevarlo. Ibuprofeno no alivia.",
    motivo: "Dolor cervical irradiado a brazo izquierdo",
    diagnosticoFisioterapeutico: "Cervicobraquialgia izquierda con limitación funcional",
    tratamientoPropuesto: "1. Terapia manual cervical\n2. Ejercicios de movilidad\n3. Electroterapia"
  };

  const visit2: PatientVisit = {
    id: "nuria-visita-002",
    patientId,
    visitDate: new Date("2025-05-10T08:00:00Z").toISOString(),
    visitType: "follow-up",
    status: "scheduled",
    notes: "Programada reevaluación con sospecha de cervicobraquialgia.",
    // Campos vacíos intencionalmente para probar detección
    motivo: "",
    diagnosticoFisioterapeutico: "",
    tratamientoPropuesto: ""
  };

  await VisitService.create(visit1);
  await VisitService.create(visit2);

  const visits = await VisitService.getByPatientId(patientId);
  trace.span({ name: "getByPatientId", input: { patientId }, output: visits });

  // Evaluación de campos requeridos
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

    if (visit.diagnosticoFisioterapeutico?.toLowerCase().includes("cervic") && !visit.tratamientoPropuesto?.toLowerCase().includes("cervic")) {
      issues.push("⚠️ El tratamiento no especifica abordaje cervical mencionado en diagnóstico");
    }

    // Verificar trazabilidad
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

  visits.forEach(evaluateVisit);

  if (visits.length === 2) {
    console.log("\n✅ Test PASÓ: Nuria tiene 2 visitas registradas.");
  } else {
    console.error("\n❌ Test FALLÓ: Se esperaban 2 visitas para Nuria.");
  }

  // Finalizar el trace y enviar datos
  await trace.end();
  await langfuse.shutdownAsync();
} 