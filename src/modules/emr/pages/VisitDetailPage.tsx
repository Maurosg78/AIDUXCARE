import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import VisitService from "../services/VisitService";
import { PatientVisit } from "../models/PatientVisit";
import { Typography, Stack, Paper, Divider } from "@mui/material";

const VisitDetailPage: React.FC = () => {
  const { visitId } = useParams<{ visitId: string }>();
  const [visit, setVisit] = useState<PatientVisit | null>(null);

  useEffect(() => {
    if (!visitId) return;
    VisitService.getByVisitId(visitId).then((data) => setVisit(data || null));
  }, [visitId]);

  if (!visit) return <div>Cargando visita...</div>;

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Detalle de Visita
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Stack spacing={2}>
        <Typography><strong>Fecha:</strong> {visit.visitDate}</Typography>
        <Typography><strong>Tipo:</strong> {visit.visitType}</Typography>
        <Typography><strong>Estado:</strong> {visit.status}</Typography>
        <Typography><strong>Notas:</strong> {visit.notes || "Sin notas"}</Typography>
      </Stack>
    </Paper>
  );
};

export default VisitDetailPage; 