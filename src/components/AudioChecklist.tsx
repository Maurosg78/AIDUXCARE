import React, { useState } from 'react';
import { Box, Button, List, ListItem, ListItemIcon, ListItemText, Checkbox, Typography, Alert, CircularProgress, Stack, Chip } from '@mui/material';
import { trackEvent } from '@/core/lib/langfuse.client';
import axios from 'axios';

// Mapeo de campos internos a campos clínicos estándar
const FIELD_MAPPING = {
  motivoConsulta: "anamnesis",
  hallazgosExploracion: "exploracion",
  diagnosticoFisioterapeutico: "diagnostico",
  tratamientoPropuesto: "plan"
};

interface ValidationAlert {
  type: string;
  message: string;
  field?: string;
}

interface AudioChecklistProps {
  patientId: string;
  visitId: string;
  onDataValidated: (data: { field: string; value: string }[]) => void;
}

export default function AudioChecklist({ _patientId, visitId, onDataValidated }: AudioChecklistProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validatedData, setValidatedData] = useState<Array<{
    field: string;
    value: string;
    isValid: boolean;
  }>>([]);
  const [validationResult, setValidationResult] = useState<{
    passed: boolean;
    alerts: ValidationAlert[];
    fieldsValidated: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startListening = () => {
    setIsListening(true);
    trackEvent("audio.start_listening", {
      timestamp: new Date().toISOString()
    });

    // Simular datos capturados por voz con los nuevos campos clínicos estándar
    setTimeout(() => {
      const mockData = [
        { field: "motivoConsulta", value: "Paciente de 45 años refiere dolor lumbar de características mecánicas desde hace 3 semanas. Sin antecedentes traumáticos. Refiere empeoramiento con actividades de carga o sedestación prolongada y alivio parcial con reposo.", isValid: false },
        { field: "hallazgosExploracion", value: "Postura antiálgica. Limitación a la flexión lumbar. Dolor a la palpación en musculatura paravertebral. Prueba de Lasègue negativa. No déficit neurológico.", isValid: false },
        { field: "diagnosticoFisioterapeutico", value: "Lumbalgia mecánica inespecífica", isValid: false },
        { field: "tratamientoPropuesto", value: "1. Terapia manual con técnicas miofasciales. 2. Electroterapia analgésica. 3. Ejercicios de estabilización core. 4. Recomendaciones ergonómicas.", isValid: false }
      ];
      setValidatedData(mockData);
      setIsListening(false);
    }, 2000);
  };

  const toggleFieldValidation = (index: number) => {
    const newData = [...validatedData];
    newData[index].isValid = !newData[index].isValid;
    setValidatedData(newData);

    trackEvent("audio.validate_field", {
      field: newData[index].field,
      value: newData[index].value,
      validated: newData[index].isValid,
      timestamp: new Date().toISOString()
    });
  };

  const handleApproveData = async () => {
    const approvedFields = validatedData
      .filter(item => item.isValid)
      .map(item => ({ 
        field: item.field, 
        value: item.value 
      }));

    if (approvedFields.length === 0) {
      setError("Debes validar al menos un campo para continuar");
      return;
    }

    trackEvent("audio.approve_data", {
      fields: approvedFields,
      timestamp: new Date().toISOString()
    });

    // Primero notificamos al componente padre para actualizar el formulario
    onDataValidated(approvedFields);
    
    // Luego procesamos el flujo automático de validación
    await processValidationFlow(approvedFields);
  };

  const processValidationFlow = async (approvedFields: { field: string; value: string }[]) => {
    setIsSaving(true);
    setError(null);
    
    try {
      // 1. Almacenar cada campo validado en /api/mcp/store
      const storePromises = approvedFields.map(async (item) => {
        // Mapear el campo interno al campo clínico estándar
        const mappedField = FIELD_MAPPING[item.field as keyof typeof FIELD_MAPPING];
        
        if (!mappedField) {
          console.warn(`Campo no mapeado: ${item.field}`);
          return null;
        }
        
        const storePayload = {
          visit_id: visitId,
          field: mappedField,
          role: "health_professional",
          content: item.value,
          overwrite: true
        };
        
        const response = await axios.post('/api/mcp/store', storePayload);
        return response.data;
      });
      
      // Esperar a que se guarden todos los campos
      const storeResults = await Promise.all(storePromises);
      
      // Verificar si alguno falló
      const failedStores = storeResults.filter(result => !result || !result.success);
      if (failedStores.length > 0) {
        throw new Error(`No se pudieron almacenar ${failedStores.length} campos`);
      }
      
      // 2. Si todos se guardaron correctamente, ejecutar la validación
      setIsSaving(false);
      setIsValidating(true);
      
      const validateResponse = await axios.get('/api/mcp/validate', {
        params: { visit_id: visitId }
      });
      
      setValidationResult({
        passed: validateResponse.data.validation_passed,
        alerts: validateResponse.data.alerts || [],
        fieldsValidated: validateResponse.data.fields_validated || []
      });
      
      trackEvent("validation.completed", {
        visit_id: visitId,
        passed: validateResponse.data.validation_passed,
        alerts_count: (validateResponse.data.alerts || []).length,
        timestamp: new Date().toISOString()
      });
      
    } catch (err) {
      console.error("Error en el flujo de validación:", err);
      setError(err instanceof Error ? err.message : "Error inesperado en el proceso de validación");
      
      trackEvent("validation.error", {
        visit_id: visitId,
        error: err instanceof Error ? err.message : "Error desconocido",
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsSaving(false);
      setIsValidating(false);
    }
  };

  const getValidationSummary = () => {
    if (!validationResult) return null;
    
    const totalFields = 4; // anamnesis, exploracion, diagnostico, plan
    const registeredFields = validationResult.fieldsValidated.length;
    const alertCount = validationResult.alerts.length;
    
    let status = "✅ Completo";
    if (alertCount > 0) {
      status = "⚠️ Revisión necesaria";
    } else if (registeredFields < totalFields) {
      status = "⚠️ Incompleto";
    }
    
    return { registeredFields, totalFields, alertCount, status };
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="contained"
          color={isListening ? "error" : "primary"}
          onClick={startListening}
          disabled={isListening || isSaving || isValidating}
        >
          {isListening ? "🎙️ Escuchando..." : "🎙️ Iniciar Escucha"}
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {validatedData.length > 0 && (
        <>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Validar datos capturados:
          </Typography>
          <List>
            {validatedData.map((item, index) => (
              <ListItem key={item.field} dense onClick={() => toggleFieldValidation(index)}>
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
            disabled={!validatedData.some(item => item.isValid) || isSaving || isValidating}
            sx={{ mt: 2 }}
          >
            {isSaving ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                Guardando...
              </>
            ) : isValidating ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                Validando...
              </>
            ) : (
              '✅ Aprobar y Validar Registros'
            )}
          </Button>
        </>
      )}
      
      {validationResult && (
        <Box sx={{ mt: 4, p: 2, border: '1px solid #e0e0e0', borderRadius: 1, bgcolor: '#f9f9f9' }}>
          <Typography variant="h6" gutterBottom>
            🔒 Calidad clínica validada:
          </Typography>
          
          {getValidationSummary() && (
            <Stack spacing={1}>
              <Typography variant="body2">
                - Campos registrados: {getValidationSummary()?.registeredFields}/{getValidationSummary()?.totalFields}
              </Typography>
              <Typography variant="body2">
                - Alertas legales: {getValidationSummary()?.alertCount}
              </Typography>
              <Typography variant="body2">
                - Estado general: {getValidationSummary()?.status}
              </Typography>
              
              {validationResult.alerts.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Detalles de las alertas:</Typography>
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    {validationResult.alerts.map((alert, index) => (
                      <Alert key={index} severity="warning" sx={{ py: 0 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Chip size="small" label={alert.field || 'general'} />
                          {alert.message}
                        </Stack>
                      </Alert>
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          )}
        </Box>
      )}
    </Box>
  );
} 