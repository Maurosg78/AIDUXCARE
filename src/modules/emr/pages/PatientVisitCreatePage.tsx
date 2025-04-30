import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography } from '@mui/material';
import NewVisitForm from '../components/visits/NewVisitForm';

const PatientVisitCreatePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <Container>
      <Typography variant="h4" gutterBottom>Nueva Visita Clínica</Typography>
      <NewVisitForm patientId={id} />
    </Container>
  );
};

export default PatientVisitCreatePage;
