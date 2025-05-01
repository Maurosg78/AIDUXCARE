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
  const [formData, setFormData] = useState({
    visitType: "",
    motivo: "",
    observaciones: "",
    diagnostico: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const visit: PatientVisit = {
      id: crypto.randomUUID(),
      patientId,
      ...formData,
      visitDate: new Date().toISOString(),
      alertas: [],
      status: "Abierta"
    };

    try {
      await VisitService.create(visit);
      navigate(`/patients/${patientId}`);
    } catch (error) {
      console.error("Error creating visit:", error);
    }
  };

  return (
    <Stack 
      component="form"
      onSubmit={handleSubmit}
      spacing={2}
      aria-labelledby="new-visit-title"
    >
      <Typography 
        id="new-visit-title"
        variant="h6" 
        component="h2"
      >
        Nueva Visita
      </Typography>

      <TextField
        select
        label="Tipo de Visita"
        value={formData.visitType}
        onChange={(e) => setFormData({ ...formData, visitType: e.target.value })}
        required
        id="visit-type-select"
        aria-label="Seleccionar tipo de visita"
      >
        {visitTypes.map((type) => (
          <MenuItem key={type} value={type}>
            {type}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Motivo de la Visita"
        value={formData.motivo}
        onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
        required
        multiline
        rows={2}
        id="visit-reason-input"
        aria-label="Motivo de la visita"
      />

      <TextField
        label="Observaciones"
        value={formData.observaciones}
        onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
        required
        multiline
        rows={4}
        id="visit-observations-input"
        aria-label="Observaciones de la visita"
      />

      <TextField
        label="Diagnóstico"
        value={formData.diagnostico}
        onChange={(e) => setFormData({ ...formData, diagnostico: e.target.value })}
        required
        multiline
        rows={2}
        id="visit-diagnosis-input"
        aria-label="Diagnóstico de la visita"
      />

      <Button 
        type="submit" 
        variant="contained" 
        color="primary"
        aria-label="Guardar visita"
      >
        Guardar Visita
      </Button>
    </Stack>
  );
};

export default NewVisitForm;

