import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Paper, Typography, CircularProgress, Alert, List, ListItem, ListItemText } from "@mui/material";
import PatientService from "../../services/PatientService";
import VisitService from "../../services/VisitService";
import { Patient, PatientVisit } from "../../models";

const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<PatientVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const patientData = await PatientService.getById(id!);
        const patientVisits = await VisitService.getByPatientId(id!);
        if (!patientData) {
          setError("Paciente no encontrado");
        } else {
          setPatient(patientData);
          setVisits(patientVisits);
        }
      } catch (err) {
        setError("Error cargando el detalle del paciente.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!patient) return null;

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        {patient.firstName} {patient.lastName}
      </Typography>
      <Typography variant="body1">Fecha de nacimiento: {patient.dateOfBirth}</Typography>
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
                secondary={`Tipo: ${visit.visitType} | Estado: ${visit.status}`}
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

