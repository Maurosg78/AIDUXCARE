import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, CircularProgress, Alert } from "@mui/material";
import PatientForm from "../components/patients/PatientForm";
import PatientService from "@/core/services/patient/PatientService";
import { Patient } from "../models";

const PatientEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    PatientService.getById(id)
      .then((data: Patient | undefined) => {
        if (data) {
          setPatient(data);
        } else {
          setError("Paciente no encontrado");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar paciente");
        setLoading(false);
      });
  }, [id]);

  const handleUpdate = (patient: Patient) => {
    setLoading(true);
    PatientService.update(patient)
      .then(() => navigate("/assistant/patients"))
      .catch(() => setError("Error al actualizar"))
      .finally(() => setLoading(false));
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!patient) return <Alert severity="error">Paciente no encontrado</Alert>;

  return (
    <Container sx={{ mt: 4 }}>
      <PatientForm initialData={patient} onSubmit={handleUpdate} />
    </Container>
  );
};

export default PatientEditPage;
