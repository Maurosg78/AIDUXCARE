import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Typography, CircularProgress, Alert } from "@mui/material";
import { Patient } from "../../models/Patient";
import PatientService from "../../services/PatientService";
import PatientForm from "./PatientForm";

const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    PatientService.getInstance()
      .getPatientById(id)
      .then(data => {
        if (data) {
          setPatient(data);
        } else {
          setError("Paciente no encontrado");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error cargando el paciente");
        setLoading(false);
      });
  }, [id]);

  return (
    <Container sx={{ mt: 4 }}>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {patient && (
        <>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Detalles del paciente
          </Typography>
        </>
      )}
    </Container>
  );
};

export default PatientDetailPage;

