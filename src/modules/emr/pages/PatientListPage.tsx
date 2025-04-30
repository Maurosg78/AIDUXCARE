import React, { useEffect, useState } from "react";
import { Container, Typography, CircularProgress, Alert, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PatientService from "../services/PatientService";
import PatientList from "../components/patients/PatientList";
import { Patient } from "../models";

const PatientListPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    PatientService.getAll()
      .then((data: Patient[]) => {
        setPatients(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar los pacientes");
        setLoading(false);
      });
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

