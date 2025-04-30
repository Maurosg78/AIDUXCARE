import React, { useEffect, useState } from "react";
import { Container, Typography, CircularProgress, Alert, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PatientService from "../services/PatientService";
import PatientList from "../components/patients/PatientList";
import { Patient } from "../models/Patient";

const PatientListPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    PatientService.getInstance()
      .getPatients()
      .then(setPatients)
      .catch(err => setError("Error al cargar los pacientes"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 2 }}>Listado de pacientes</Typography>
      <Button
        variant="contained"
        color="primary"
        sx={{ mb: 2 }}
        onClick={() => navigate("/patients/new")}
      >
        + Nuevo paciente
      </Button>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && <PatientList patients={patients} />}
    </Container>
  );
};

export default PatientListPage;

