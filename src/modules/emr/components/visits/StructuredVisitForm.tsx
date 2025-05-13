import { useState, useEffect  } from 'react';
import { TextField, Button, Stack, Typography, Drawer, Box, TextareaAutosize } from "@mui/material";
import { trackEvent } from '@/core/lib/langfuse.client';
import type { PatientEval  } from '@/modules/emr/types/Evaluation';
import { CopilotFeedback } from '@/modules/ai/CopilotService';
import VisitAlert from '@/modules/emr/components/alerts/VisitAlert';
import CopilotPanel from '@/modules/assistant/components/CopilotPanel';
import VisitService from '@/core/services/visit/VisitService';

const drawerWidth = 340;

const StructuredVisitForm = () => {
  console.log("✅ RENDER STRUCTURED VISIT FORM");
  
  const [formData, setFormData] = useState({
    id: crypto.randomUUID(),
    patientId: "unknown",
    visitDate: "",
    motivo: "",
    observaciones: "",
    diagnostico: "",
    alertas: [] as string[],
    feedback: [] as CopilotFeedback[],
    visitType: "",
    status: "",
    anamnesis: "",
    physicalExam: "",
    treatmentPlan: "",
    notes: "",
    traceId: crypto.randomUUID()
  });
  const [warnings, setWarnings] = useState<string[]>([]);

  const handleChange = (field: keyof PatientEval) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    console.log(`[Langfuse] Cambio en campo '${field}' →`, value);
    
    if (typeof trackEvent !== "function") {
      console.error("[Langfuse] ERROR: trackEvent no es una función");
    } else {
      console.log("[Langfuse] Ejecutando trackEvent con:", {
        field: field,
        value: value,
        traceId: formData?.traceId
      });
    }
    
    trackEvent({
      name: "form.update",
      payload: { 
        field, 
        value, 
        patientId: formData.patientId 
      },
      traceId: formData.traceId
    });
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Sincronizar formData local con props
  useEffect(() => {
    setFormData(formData);
  }, [formData]);

  const handleSuggestionApply = (feedback: CopilotFeedback) => {
    // TODO: Implementar la lógica para aplicar sugerencias
    console.log('Aplicando sugerencia:', feedback);
  };

  const handleSave = async () => {
    const newWarnings: string[] = [];
    if (!formData.visitDate) newWarnings.push("Falta la fecha de la visita.");
    if (!formData.visitType) newWarnings.push("Falta el tipo de visita.");
    if (!formData.status) newWarnings.push("Falta el estado de la visita.");
    if (!formData.anamnesis) newWarnings.push("Falta la anamnesis.");
    if (!formData.physicalExam) newWarnings.push("Falta la exploración física.");
    if (!formData.diagnostico) newWarnings.push("Falta el diagnóstico.");
    if (!formData.treatmentPlan) newWarnings.push("Falta el plan de tratamiento.");

    setWarnings(newWarnings);

    if (newWarnings.length === 0) {
      try {
        await VisitService.create(formData);
        alert("Visita guardada correctamente.");
      } catch (error) {
        console.error("Error al guardar visita:", error);
        alert("Error al guardar la visita. Por favor, inténtelo de nuevo.");
      }
    }
  };

  // Asegurarnos de que formData incluya la propiedad visitId
  const updatedFormData = {
    ...formData,
    visitId: formData.id || ''
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Stack 
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        spacing={2}
        aria-labelledby="structured-visit-title"
        sx={{ 
          flexGrow: 1,
          mr: { md: `${drawerWidth}px` },
          p: 2
        }}
      >
        <Typography 
          id="structured-visit-title"
          variant="h6" 
          component="h2"
        >
          Visita Estructurada
        </Typography>

        <TextField
          label="Fecha de Visita"
          type="date"
          name="visitDate"
          value={formData.visitDate}
          onChange={handleChange('visitDate')}
          required
          InputLabelProps={{ shrink: true }}
          id="visit-date-input"
          aria-label="Fecha de la visita"
        />

        <TextField
          label="Tipo de Visita"
          name="visitType"
          value={formData.visitType}
          onChange={handleChange('visitType')}
          required
          id="visit-type-input"
          aria-label="Tipo de visita"
        />

        <TextField
          label="Estado"
          name="status"
          value={formData.status}
          onChange={handleChange('status')}
          required
          id="visit-status-input"
          aria-label="Estado de la visita"
        />

        <TextareaAutosize
          name="anamnesis"
          value={formData.anamnesis}
          onChange={handleChange("anamnesis")}
          placeholder="Anamnesis"
          style={{ width: '100%', minHeight: '100px', padding: '8px' }}
        />

        <TextareaAutosize
          name="physicalExam"
          value={formData.physicalExam}
          onChange={handleChange("physicalExam")}
          placeholder="Exploración Física"
          style={{ width: '100%', minHeight: '100px', padding: '8px' }}
        />

        <TextField
          label="Diagnóstico"
          name="diagnostico"
          value={formData.diagnostico}
          onChange={handleChange('diagnostico')}
          required
          multiline
          rows={2}
          id="visit-diagnosis-input"
          aria-label="Diagnóstico de la visita"
        />

        <TextField
          label="Plan de Tratamiento"
          name="treatmentPlan"
          value={formData.treatmentPlan}
          onChange={handleChange('treatmentPlan')}
          required
          multiline
          rows={4}
          id="visit-treatment-plan-input"
          aria-label="Plan de tratamiento de la visita"
        />

        <TextField
          label="Notas Adicionales"
          name="notes"
          value={formData.notes}
          onChange={handleChange('notes')}
          multiline
          rows={2}
          id="visit-notes-input"
          aria-label="Notas adicionales de la visita"
        />

        <VisitAlert warnings={warnings} />

        <Button 
          type="submit"
          variant="contained" 
          color="primary"
          aria-label="Guardar visita estructurada"
        >
          Guardar Visita
        </Button>
      </Stack>

      <Drawer
        variant="permanent"
        anchor="right"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            p: 2
          },
        }}
      >
        <Typography variant="h6" gutterBottom>
          Copiloto Clínico
        </Typography>
        <CopilotPanel formData={updatedFormData} onApplySuggestion={handleSuggestionApply} />
      </Drawer>
    </Box>
  );
};

export default StructuredVisitForm;

