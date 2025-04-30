import React from "react";
import { Container } from "@mui/material";
import NewVisitForm from "../components/visits/NewVisitForm";

export default function NewVisitPage() {
  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <NewVisitForm />
    </Container>
  );
}

