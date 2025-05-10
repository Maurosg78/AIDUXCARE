import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Box, Typography, Paper, Container } from '@mui/material';
import PatientForm from "@/modules/emr/components/patients/PatientForm";
import PatientService from "@/core/services/patient/PatientService";
import { Patient } from "@/core/types";

export default function PatientCreatePage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Función para crear un nuevo paciente
  const handleCreate = async (newPatient: Patient): Promise<void> => {
    try {
      setIsLoading(true);
      // Omitimos el ID ya que se generará automáticamente
      const createdPatient = await PatientService.createPatient(newPatient);
      navigate(`/patients/${createdPatient.id}`);
    } catch (err) {
      console.error("Error al crear paciente:", err);
      setError("No se pudo crear el paciente. Por favor, inténtelo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Registrar Nuevo Paciente
        </Typography>
        
        {error && (
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
            <Typography>{error}</Typography>
          </Paper>
        )}
        
        <PatientForm onSubmit={handleCreate} />
      </Box>
    </Container>
  );
}

