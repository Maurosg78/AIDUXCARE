import 'dotenv/config';
import { Langfuse } from "langfuse";
import VisitService from "../../src/modules/emr/services/VisitService";

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

  const visit1 = {
    id: "nuria-visita-001",
    patientId,
    visitDate: new Date("2025-05-01T08:00:00Z").toISOString(),
    visitType: "initial",
    status: "completed",
    notes: "Dolor irradiado en brazo izquierdo, no puede elevarlo. Ibuprofeno no alivia."
  };

  const visit2 = {
    id: "nuria-visita-002",
    patientId,
    visitDate: new Date("2025-05-10T08:00:00Z").toISOString(),
    visitType: "follow-up",
    status: "scheduled",
    notes: "Programada reevaluación con sospecha de cervicobraquialgia."
  };

  await VisitService.create(visit1);
  await VisitService.create(visit2);

  const visits = await VisitService.getByPatientId(patientId);
  trace.span({ name: "getByPatientId", input: { patientId }, output: visits });

  if (visits.length === 2) {
    console.log("✅ Test PASÓ: Nuria tiene 2 visitas registradas.");
  } else {
    console.error("❌ Test FALLÓ: Se esperaban 2 visitas para Nuria.");
  }

  // No se usa trace.end(), se finaliza el cliente para asegurar el envío de datos
  await langfuse.shutdownAsync();
} 