import React, { FC, useState } from "react";
import { TextField, Button, MenuItem, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { PatientVisit } from "../../models/PatientVisit";
import VisitService from "../../services/VisitService";

const visitTypes = ["Consulta inicial", "Control", "Reevaluación", "Alta"];

interface NewVisitFormProps {
  patientId: string;
}

const NewVisitForm: FC<NewVisitFormProps> = ({ patientId }) => {
  const navigate = useNavigate();

  const [visit, setVisit] = useState<Partial<PatientVisit>>({
    patientId,
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
};

export default NewVisitForm;

