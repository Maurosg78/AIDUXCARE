import React, { useEffect, useState } from "react";
import { Paper, Typography, CircularProgress, Alert, List, ListItem, ListItemText } from "@mui/material";
import PatientService from "@/core/services/patient/PatientService";
import VisitService from "@/core/services/visit/VisitService";
import { Patient, Visit } from "@/core/types";

interface PatientDetailProps {
  patientId: string;
}

const PatientDetail: React.FC<PatientDetailProps> = ({ patientId }) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!patientId) {
          setError("ID de paciente no proporcionado");
          setLoading(false);
          return;
        }
        
        const patientData = await PatientService.getById(patientId);
        const patientVisits = await VisitService.getByPatientId(patientId);
        if (!patientData) {
          setError("Paciente no encontrado");
        } else {
          setPatient(patientData);
          setVisits(patientVisits);
        }
      } catch (err: unknown) {
        console.error("Error cargando datos:", err);
        setError("Error cargando el detalle del paciente.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [patientId]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!patient) return null;

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        {patient.firstName} {patient.lastName}
      </Typography>
      <Typography variant="body1">Fecha de nacimiento: {patient.birthDate}</Typography>
      <Typography variant="body1">Género: {patient.gender}</Typography>
      <Typography variant="body1">Email: {patient.email || "No disponible"}</Typography>
      <Typography variant="body1">Teléfono: {patient.phone || "No disponible"}</Typography>

      <Typography variant="h6" sx={{ mt: 4 }}>
        Historial de visitas
      </Typography>
      {visits.length > 0 ? (
        <List>
          {visits.map((visit) => (
            <ListItem key={visit.id}>
              <ListItemText
                primary={`Fecha: ${visit.visitDate}`}
                secondary={`Tipo: ${visit.type} | Estado: ${visit.status}`}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2">No hay visitas registradas.</Typography>
      )}
    </Paper>
  );
};

export default PatientDetail;

