import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Divider } from "@mui/material";
import VisitService from "@/modules/emr/services/VisitService";
import { PatientVisit } from "@/modules/emr/models/PatientVisit";
import EvalTimeline from "@/modules/emr/components/EvalTimeline";

export default function VisitDetailPage() {
  const { visitId } = useParams<{ visitId: string }>();
  const [visit, setVisit] = useState<PatientVisit | null>(null);

  useEffect(() => {
    async function fetchVisit() {
      if (visitId) {
        const fetched = await VisitService.getByVisitId(visitId);
        setVisit(fetched ?? null);
      }
    }
    fetchVisit();
  }, [visitId]);

  if (!visit) return <div>❌ No se encontró la visita.</div>;

  return (
    <Box sx={{ p: 3 }}>
      <h1>🩺 Detalle de Visita</h1>
      <Box sx={{ mb: 4 }}>
        <p><strong>ID:</strong> {visit.id}</p>
        <p><strong>Paciente:</strong> {visit.patientId}</p>
        <p><strong>Fecha:</strong> {visit.visitDate}</p>
        <p><strong>Tipo:</strong> {visit.visitType}</p>
        <p><strong>Estado:</strong> {visit.status}</p>
        <p><strong>Notas:</strong> {visit.notes}</p>
      </Box>

      <Divider sx={{ my: 3 }} />
      
      <EvalTimeline patientId={visit.patientId} />
    </Box>
  );
}
