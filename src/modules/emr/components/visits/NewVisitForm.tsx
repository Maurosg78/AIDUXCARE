import React, { useState } from "react";
import VisitAlert from "../../components/alerts/VisitAlert";
import { TextField, Button, MenuItem, Stack, Typography } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { PatientVisit } from "../../models/PatientVisit";
import VisitService from "../../services/VisitService";

const visitTypes = ["Consulta inicial", "Control", "Reevaluación", "Alta"];


function validateVisit(visit) {
  const warnings = [];
  if (!visit.visitDate) warnings.push("Falta la fecha de la visita.");
  if (!visit.visitType) warnings.push("Falta el tipo de visita.");
  if (!visit.status) warnings.push("Falta el estado de la visita.");
  return warnings;
}
export default function NewVisitForm() {
  const { id: patientId } = useParams();
  const navigate = useNavigate();

  const [visit, setVisit] = useState<Partial<PatientVisit>>({
    patientId: patientId || "",
    visitDate: new Date().toISOString().split("T")[0],
    visitType: "",
    status: "Abierta",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVisit((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = () => {
    if (!visit.visitType || !visit.visitDate || !visit.patientId) {
      alert("Faltan campos obligatorios.");
      return;
    }

    VisitService.create({
      ...visit,
      id: crypto.randomUUID(),
    } as PatientVisit);

    navigate(`/assistant/patient/${patientId}`);
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Nueva Visita Clínica</Typography>

      <TextField
        select
        label="Tipo de visita"
        name="visitType"
        value={visit.visitType}
        onChange={handleChange}
        required
      >
        {visitTypes.map((type) => (
          <MenuItem key={type} value={type}>
            {type}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Fecha"
        type="date"
        name="visitDate"
        value={visit.visitDate}
        onChange={handleChange}
        InputLabelProps={{ shrink: true }}
        required
      />

      <TextField
        label="Notas"
        name="notes"
        value={visit.notes}
        onChange={handleChange}
        multiline
        rows={4}
      />

      <Button variant="contained" onClick={handleSubmit}>
        Guardar visita
      </Button>
    </Stack>
  );
}

