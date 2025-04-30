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
    <Stack spacing={2}>
      <Typography variant="h5">Evaluación Clínica</Typography>
      {warnings.length > 0 && <VisitAlert warnings={warnings} />}
      <TextField label="Fecha" name="visitDate" type="date" InputLabelProps={{ shrink: true }} value={formData.visitDate} onChange={handleChange} />
      <TextField label="Tipo de Visita" name="visitType" value={formData.visitType} onChange={handleChange} />
      <TextField label="Estado" name="status" value={formData.status} onChange={handleChange} />
      <TextField label="Anamnesis" name="anamnesis" multiline minRows={3} value={formData.anamnesis} onChange={handleChange} />
      <TextField label="Exploración Física" name="physicalExam" multiline minRows={3} value={formData.physicalExam} onChange={handleChange} />
      <TextField label="Diagnóstico" name="diagnosis" multiline minRows={3} value={formData.diagnosis} onChange={handleChange} />
      <TextField label="Plan de Tratamiento" name="treatmentPlan" multiline minRows={3} value={formData.treatmentPlan} onChange={handleChange} />
      <TextField label="Notas Adicionales" name="notes" multiline minRows={2} value={formData.notes} onChange={handleChange} />
      <Button variant="contained" onClick={handleSave}>Guardar Evaluación</Button>
    </Stack>
  );
};

export default StructuredVisitForm;

