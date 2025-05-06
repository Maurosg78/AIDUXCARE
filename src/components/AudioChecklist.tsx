import React, { useState } from 'react';
import { Box, Button, List, ListItem, ListItemIcon, ListItemText, Checkbox, Typography } from '@mui/material';
import { trackEvent } from '@/core/lib/langfuse.client';

interface AudioChecklistProps {
  patientId: string;
  visitId: string;
  onDataValidated: (data: { field: string; value: string }[]) => void;
}

export default function AudioChecklist({ patientId, visitId, onDataValidated }: AudioChecklistProps) {
  const [isListening, setIsListening] = useState(false);
  const [validatedData, setValidatedData] = useState<Array<{
    field: string;
    value: string;
    isValid: boolean;
  }>>([]);

  const startListening = () => {
    setIsListening(true);
    trackEvent({
      name: "audio.start_listening",
      payload: {
        timestamp: new Date().toISOString()
      }
    });

    // Simular datos capturados por voz
    setTimeout(() => {
      const mockData = [
        { field: "motivoConsulta", value: "Dolor cervical recurrente", isValid: false },
        { field: "diagnosticoFisioterapeutico", value: "Cervicalgia mecánica", isValid: false },
        { field: "tratamientoPropuesto", value: "Terapia manual + ejercicios", isValid: false }
      ];
      setValidatedData(mockData);
      setIsListening(false);
    }, 2000);
  };

  const handleValidateField = (field: string, value: string) => {
    const newData = { ...validatedData, [field]: value };
    setValidatedData(newData);

    trackEvent({
      name: "audio.validate_field",
      payload: {
        field,
        value,
        timestamp: new Date().toISOString()
      }
    });
  };

  const handleApproveData = () => {
    const approvedFields = Object.entries(validatedData)
      .map(([field, value]) => ({ field, value }));

    trackEvent({
      name: "audio.approve_data",
      payload: {
        fields: approvedFields,
        timestamp: new Date().toISOString()
      }
    });

    onDataValidated(approvedFields);
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="contained"
          color={isListening ? "error" : "primary"}
          onClick={startListening}
          disabled={isListening}
        >
          {isListening ? "🎙️ Escuchando..." : "🎙️ Iniciar Escucha"}
        </Button>
      </Box>

      {validatedData.length > 0 && (
        <>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Validar datos capturados:
          </Typography>
          <List>
            {validatedData.map((item, index) => (
              <ListItem key={item.field} dense button onClick={() => handleValidateField(item.field, item.value)}>
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={item.isValid}
                    tabIndex={-1}
                    disableRipple
                  />
                </ListItemIcon>
                <ListItemText 
                  primary={item.field}
                  secondary={item.value}
                />
              </ListItem>
            ))}
          </List>

          <Button
            variant="contained"
            color="success"
            onClick={handleApproveData}
            disabled={!validatedData.some(item => item.isValid)}
            sx={{ mt: 2 }}
          >
            ✅ Aprobar Datos Validados
          </Button>
        </>
      )}
    </Box>
  );
} 