import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Box, Typography, Paper, Container } from '@mui/material';
import PatientService from "@/core/services/patient/PatientService";
import PatientForm from "@/modules/emr/components/patients/PatientForm";
import { Patient } from "@/core/types";
import LoadingOverlay from "@/core/components/LoadingOverlay";

export default function PatientEditPage() {
  // Obtenemos el ID del paciente de los parámetros de la URL
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  
  // Estado para el paciente y loading
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Efecto para cargar los datos del paciente
  useEffect(() => {
    const loadPatient = async () => {
      try {
        setIsLoading(true);
        if (!patientId) {
          throw new Error("ID de paciente no encontrado");
        }
        
        const patientData = await PatientService.getPatientById(patientId);
        setPatient(patientData);
      } catch (err) {
        console.error("Error al cargar el paciente:", err);
        setError("No se pudo cargar la información del paciente");
      } finally {
        setIsLoading(false);
      }
    };

    loadPatient();
  }, [patientId]);

  // Función para manejar la actualización del paciente
  const handleUpdate = (patient: Patient) => {
    PatientService.updatePatient(patientId!, patient)
      .then(() => {
        navigate(`/patients/${patientId}`);
      })
      .catch(err => {
        console.error("Error al actualizar paciente:", err);
        setError("Error al guardar los cambios");
      });
  };

  if (isLoading) return <LoadingOverlay />;

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Editar Paciente
        </Typography>
        
        {error && (
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
            <Typography>{error}</Typography>
          </Paper>
        )}
        
        {patient && (
          <PatientForm initialData={patient} onSubmit={handleUpdate} />
        )}
      </Box>
    </Container>
  );
}
