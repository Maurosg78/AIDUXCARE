// import React from 'react';
import { useParams } from 'react-router-dom';
import { Container } from "@mui/material";
import NewVisitForm from '../components/visits/NewVisitForm';

export default function NewVisitPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <NewVisitForm patientId={id!} />
    </Container>
  );
}

