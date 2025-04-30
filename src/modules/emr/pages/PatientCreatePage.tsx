import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography } from "@mui/material";
import PatientForm from "../components/patients/PatientForm";
import PatientService from "../services/PatientService";
import { Patient } from "../models/Patient";

const PatientCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const handleCreate = async (newPatient: Patient) => {
    await PatientService.getInstance().addPatient(newPatient);
    navigate("/assistant/patients");
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Crear nuevo paciente
      </Typography>
      <PatientForm onSubmit={handleCreate} />
    </Container>
  );
};

export default PatientCreatePage;

