import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import VisitService from "@/modules/emr/services/VisitService";
import { PatientVisit } from "@/modules/emr/models/PatientVisit";

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
    <div>
      <h1>🩺 Detalle de Visita</h1>
      <p><strong>ID:</strong> {visit.id}</p>
      <p><strong>Paciente:</strong> {visit.patientId}</p>
      <p><strong>Fecha:</strong> {visit.visitDate}</p>
      <p><strong>Tipo:</strong> {visit.visitType}</p>
      <p><strong>Estado:</strong> {visit.status}</p>
      <p><strong>Notas:</strong> {visit.notes}</p>
    </div>
  );
}
