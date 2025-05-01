import VisitService from "../../dist/modules/emr/services/VisitService.js";
export async function runMartaPerez1985Eval() {
    console.log("\n🧪 Ejecutando prueba Marta Pérez");
    const visits = [
        {
            id: "mp-v1",
            patientId: "marta-perez-1985",
            visitDate: "2025-05-01T10:00:00Z",
            visitType: "evaluation",
            status: "completed",
            notes: "Primera evaluación inicial",
        },
        {
            id: "mp-v2",
            patientId: "marta-perez-1985",
            visitDate: "2025-05-15T11:30:00Z",
            visitType: "follow-up",
            status: "scheduled",
            notes: "Control programado",
        },
    ];
    for (const visit of visits) {
        await VisitService.create(visit);
    }
    const found = await VisitService.getByPatientId("marta-perez-1985");
    console.log("Visitas encontradas:", found);
    if (found.length === 2) {
        console.log("✅ Test PASÓ: Marta tiene 2 visitas registradas.");
    }
    else {
        console.error("❌ Test FALLÓ: No se registraron correctamente.");
    }
}
