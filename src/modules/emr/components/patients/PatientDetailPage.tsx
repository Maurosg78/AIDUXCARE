import React, { useEffect, useState } from "react";
import { useParams } from '@/core/utils/router';
import { Container, Typography, CircularProgress, Alert } from "@mui/material";
import PatientService from "@/core/services/patient/PatientService";
import { Patient } from "../../models";

const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    PatientService.getById(id!)
      .then((data: Patient | undefined) => {
        if (data) {
          setPatient(data);
        } else {
          setError("Paciente no encontrado");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar el paciente");
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

