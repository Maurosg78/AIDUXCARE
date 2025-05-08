import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Typography, CircularProgress, Alert, List, ListItem, ListItemText } from "@mui/material";
import PatientService from "@/core/services/patient/PatientService";
import VisitService from "@/core/services/visit/VisitService";
import { Patient, PatientVisit } from "../models";

const PatientDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<PatientVisit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      const fetchedPatient = await PatientService.getById(id);
      const fetchedVisits = await VisitService.getByPatientId(id);
      setPatient(fetchedPatient || null);
      setVisits(fetchedVisits || []);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) return <CircularProgress />;
  if (!patient) return <Alert severity="error">Paciente no encontrado</Alert>;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>{patient.firstName} {patient.lastName}</Typography>
      <Typography variant="body1">Fecha de nacimiento: {patient.dateOfBirth}</Typography>
      <Typography variant="body1">Sexo: {patient.gender}</Typography>
      <Typography variant="body2" color="textSecondary">ID: {patient.id}</Typography>
      <Typography variant="h6" sx={{ mt: 4 }}>Visitas clínicas</Typography>
      {visits.length === 0 ? (
        <Typography variant="body2">No hay visitas registradas.</Typography>
      ) : (
        <List>
          {visits.map(visit => (
            <ListItem key={visit.id} divider>
              <ListItemText
                primary={`${visit.visitType} — ${visit.visitDate}`}
                secondary={visit.notes || "Sin notas"}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Container>
  );
};

export default PatientDetailPage;
