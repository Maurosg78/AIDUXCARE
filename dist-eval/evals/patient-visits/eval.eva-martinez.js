import VisitService from "../../dist/modules/emr/services/VisitService.js";
export async function runEvaMartinezEval() {
    console.log("🧪 Ejecutando prueba Eva Martínez\n");
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
    const visits = await VisitService.getByPatientId("eva-martinez-1988");
    console.log("Visitas encontradas:", visits);
    if (visits.length === 2) {
        console.log("✅ Test PASÓ: Eva tiene 2 visitas registradas.");
    }
    else {
        console.error(`❌ Test FALLÓ: Se esperaban 2 visitas, pero se encontraron ${visits.length}`);
        process.exit(1);
    }
}
