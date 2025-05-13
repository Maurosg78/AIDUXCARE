import VisitService from "../../dist/modules/emr/services/VisitService.js";
import { langfuse } from "../../scripts/clients/langfuseClient.mjs";

export async function runEvaMartinezEval() {
  const trace = langfuse.trace({ name: "eva-martinez-eval" });
  console.log("🧪 Ejecutando prueba Eva Martínez\n");
  
  try {
    // Limpiamos datos previos
    await VisitService.clearAll();

    // Creamos dos visitas de prueba para Eva
    await VisitService.create({
      id: "eva-visita-001",
      patientId: "eva-martinez-1988",
      visitDate: new Date().toISOString(),
      visitType: "initial",
      status: "completed",
      notes: "Primera visita de Eva"
    });
    await VisitService.create({
      id: "eva-visita-002",
      patientId: "eva-martinez-1988",
      visitDate: new Date().toISOString(),
      visitType: "follow-up",
      status: "completed",
      notes: "Segunda visita de Eva"
    });

    const span = trace.span({ name: "get-visits" });
    const visits = await VisitService.getByPatientId("eva-martinez-1988");
    span.end({
      output: { visits }
    });

    console.log("Visitas encontradas:", visits);

    if (visits.length === 2) {
      console.log("✅ Test PASÓ: Eva tiene 2 visitas registradas.");
      trace.update({ status: "success" });
    } else {
      console.error(`❌ Test FALLÓ: Se esperaban 2 visitas, pero se encontraron ${visits.length}`);
      trace.update({ status: "error" });
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error inesperado:", error);
    trace.update({ status: "error", error: error.message });
    process.exit(1);
  }
} 