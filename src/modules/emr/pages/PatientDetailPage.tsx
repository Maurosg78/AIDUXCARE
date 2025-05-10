import { useEffect, useState } from "react";
import { Container, Typography, CircularProgress, Alert, List, ListItem, ListItemText } from "@mui/material";
import PatientService from "@/core/services/patient/PatientService";
import VisitService from "@/core/services/visit/VisitService";
import { Patient, Visit } from "@/core/types";

// Esta función extrae el ID del paciente de la URL actual
const getPatientIdFromUrl = (): string | null => {
  // Ejemplo: /patients/123/detail -> extrae 123
  const match = window.location.pathname.match(/\/patients\/([^\/]+)/);
  return match ? match[1] : null;
};

const PatientDetailPage = () => {
  const patientId = getPatientIdFromUrl();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!patientId) return;
      const fetchedPatient = await PatientService.getById(patientId);
      const fetchedVisits = await VisitService.getByPatientId(patientId);
      setPatient(fetchedPatient || null);
      setVisits(fetchedVisits || []);
      setLoading(false);
    };
    fetchData();
  }, [patientId]);

  if (loading) return <CircularProgress />;
  if (!patient) return <Alert severity="error">Paciente no encontrado</Alert>;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>{patient.firstName} {patient.lastName}</Typography>
      <Typography variant="body1">Fecha de nacimiento: {patient.birthDate}</Typography>
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
                primary={`${visit.type} — ${visit.visitDate}`}
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
