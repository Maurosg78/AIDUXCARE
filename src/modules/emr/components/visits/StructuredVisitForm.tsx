import React, { useState } from "react";
import { TextField, Button, Stack, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import VisitAlert from "../alerts/VisitAlert";
import VisitService from "../../services/VisitService";

const StructuredVisitForm = () => {
  const { patientId } = useParams();
  const [formData, setFormData] = useState({
    visitDate: "",
    visitType: "",
    status: "",
    anamnesis: "",
    physicalExam: "",
    diagnosis: "",
    treatmentPlan: "",
    notes: ""
  });
  const [warnings, setWarnings] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    const newWarnings: string[] = [];
    if (!formData.visitDate) newWarnings.push("Falta la fecha de la visita.");
    if (!formData.visitType) newWarnings.push("Falta el tipo de visita.");
    if (!formData.status) newWarnings.push("Falta el estado de la visita.");
    if (!formData.anamnesis) newWarnings.push("Falta la anamnesis.");
    if (!formData.physicalExam) newWarnings.push("Falta la exploración física.");
    if (!formData.diagnosis) newWarnings.push("Falta el diagnóstico.");
    if (!formData.treatmentPlan) newWarnings.push("Falta el plan de tratamiento.");

    setWarnings(newWarnings);

    if (newWarnings.length === 0) {
      VisitService.create({
        id: crypto.randomUUID(),
        patientId: patientId || "unknown",
        ...formData
      });
      alert("Visita guardada correctamente.");
    }
  };

  return (
    <Stack 
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        handleSave();
      }}
      spacing={2}
      aria-labelledby="structured-visit-title"
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
        onChange={handleChange}
        required
        InputLabelProps={{ shrink: true }}
        id="visit-date-input"
        aria-label="Fecha de la visita"
      />

      <TextField
        label="Tipo de Visita"
        name="visitType"
        value={formData.visitType}
        onChange={handleChange}
        required
        id="visit-type-input"
        aria-label="Tipo de visita"
      />

      <TextField
        label="Estado"
        name="status"
        value={formData.status}
        onChange={handleChange}
        required
        id="visit-status-input"
        aria-label="Estado de la visita"
      />

      <TextField
        label="Anamnesis"
        name="anamnesis"
        value={formData.anamnesis}
        onChange={handleChange}
        required
        multiline
        rows={4}
        id="visit-anamnesis-input"
        aria-label="Anamnesis de la visita"
      />

      <TextField
        label="Exploración Física"
        name="physicalExam"
        value={formData.physicalExam}
        onChange={handleChange}
        required
        multiline
        rows={4}
        id="visit-physical-exam-input"
        aria-label="Exploración física de la visita"
      />

      <TextField
        label="Diagnóstico"
        name="diagnosis"
        value={formData.diagnosis}
        onChange={handleChange}
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
        onChange={handleChange}
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
        onChange={handleChange}
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
  );
};

export default StructuredVisitForm;

