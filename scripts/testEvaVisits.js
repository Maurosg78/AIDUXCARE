import VisitService from "../dist/modules/emr/services/VisitService.js";

(async () => {
  const visits = await VisitService.getByPatientId("eva-martinez-1988");
  console.log("Visitas encontradas:", visits);

  if (visits.length === 2) {
    console.log("✅ Test PASÓ: Eva tiene 2 visitas registradas.");
  } else {
    console.error("❌ Test FALLÓ: Se esperaban 2 visitas para Eva.");
    process.exit(1);
  }
})(); 