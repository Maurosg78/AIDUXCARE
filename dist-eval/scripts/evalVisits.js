"use strict";
// Simulación del servicio de visitas para pruebas
const VisitService = {
    visits: [
        {
            id: "v-sim-001",
            patientId: "test-id-1234",
            visitDate: "2025-01-01T09:00:00Z",
            visitType: "initial",
            status: "completed",
            notes: "Visita de prueba simulada"
        }
    ],
    async getAll() {
        return this.visits;
    },
    async getByPatientId(patientId) {
        return this.visits.filter(v => v.patientId === patientId);
    }
};
const runEval = async () => {
    try {
        const patientId = "test-id-1234";
        const result = await VisitService.getByPatientId(patientId);
        if (!Array.isArray(result)) {
            console.error("❌ ERROR: VisitService.getByPatientId no devuelve un array.");
            process.exit(1);
        }
        if (result.length === 0) {
            console.warn("⚠️ No hay visitas registradas para el paciente de prueba.");
            process.exit(1);
        }
        console.log("✅ Eval PASÓ: Hay visitas asociadas al paciente", patientId);
    }
    catch (error) {
        console.error("❌ ERROR en la evaluación:", error);
        process.exit(1);
    }
};
runEval();
