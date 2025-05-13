import { useEffect, useState  } from 'react';
import { Paper, Typography, Box } from "@mui/material";
import { getAssistantResponse } from "../services/assistantEngine";
import type { AssistantContext } from "../models/AssistantContext";

interface AssistantPanelProps {
  context: AssistantContext;
}

/**
 * Panel que muestra respuestas generadas por el asistente clínico
 * basadas en el contexto proporcionado.
 */
const AssistantPanel: React.FC<AssistantPanelProps> = ({ context }) => {
  const [response, setResponse] = useState<string>("...");

  useEffect(() => {
    getAssistantResponse(context).then(setResponse);
  }, [context]);

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6">🧠 Copiloto Clínico</Typography>
      <Box mt={1}>
        <Typography variant="body2" color="text.secondary">
          {response}
        </Typography>
      </Box>
    </Paper>
  );
};

export default AssistantPanel;
