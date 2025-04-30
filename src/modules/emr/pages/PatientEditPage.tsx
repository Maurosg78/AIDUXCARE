import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, CircularProgress, Alert } from "@mui/material";
import PatientForm from "../components/patients/PatientForm";
import PatientService from "../services/PatientService";
import { Patient } from "../models/Patient";

const PatientEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    PatientService.getInstance()
      .getPatientById(id)
      .then(data => {
        setPatient(data || null);
        setLoading(false);
      });
  }, [id]);

  const handleUpdate = (updatedPatient: Patient) => {
    // Simula guardado (en MVP real persistirá en backend o localStorage)
    navigate("/patients");
  };

  if (loading) return <CircularProgress />;
  if (!patient) return <Alert severity="error">Paciente no encontrado</Alert>;

  return (
    <Container sx={{ mt: 4 }}>
      <PatientForm initialData={patient} onSubmit={handleUpdate} />
    </Container>
  );
};

export default PatientEditPage;
