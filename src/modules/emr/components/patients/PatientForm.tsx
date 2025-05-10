import React, { useState, useEffect } from "react";
import { TextField, Button, Box, MenuItem, Paper, Typography } from "@mui/material";
import { Patient } from "@/core/types";

interface PatientFormProps {
  initialData?: Patient;
  onSubmit: (data: Patient) => void;
}

const genderOptions = [
  { value: "male", label: "Masculino" },
  { value: "female", label: "Femenino" },
  { value: "other", label: "Otro" },
];

const PatientForm: React.FC<PatientFormProps> = ({ initialData, onSubmit }) => {
  const [formData, setFormData] = useState<Patient>(
    initialData || {
      id: crypto.randomUUID(),
      name: "",
      firstName: "",
      lastName: "",
      birthDate: "",
      gender: "other",
      email: "",
      phone: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: Patient) => ({
      ...prev,
      [name]: value,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        {initialData ? "Editar paciente" : "Nuevo paciente"}
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Nombre"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <TextField
            label="Apellido"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
          <TextField
            label="Fecha de nacimiento"
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            select
            label="Género"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            {genderOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            label="Teléfono"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
          <Button type="submit" variant="contained" color="primary">
            {initialData ? "Guardar cambios" : "Crear paciente"}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default PatientForm;
