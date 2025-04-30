import React from "react";
import AssistantPanel from "../components/AssistantPanel";
import { Container } from "@mui/material";

const AssistantPage: React.FC = () => {
  const context = {
    patientName: "Pilar López",
    currentSymptoms: "Dolor irradiado en brazo izquierdo",
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <AssistantPanel context={context} />
    </Container>
  );
};

export default AssistantPage;
