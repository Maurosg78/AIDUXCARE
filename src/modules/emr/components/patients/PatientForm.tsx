import { useState, useEffect  } from 'react';
import { TextField, Button, Box, MenuItem, Paper, Typography } from "@mui/material";
import type { Patient } from '@/types/Patient';
import type { ChangeEvent, FormEvent } from 'react';
import type { PatientService  } from '@/types/services/PatientService';

interface PatientFormProps {
  patient?: Patient;
  onSubmit: (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

const genderOptions = [
  { value: "male", label: "Masculino" },
  { value: "female", label: "Femenino" },
  { value: "other", label: "Otro" },
];

export const PatientForm = ({ patient, onSubmit }: PatientFormProps) => {
  const [formData, setFormData] = useState<Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>>({
    firstName: patient?.firstName || '',
    lastName: patient?.lastName || '',
    email: patient?.email || '',
    phone: patient?.phone || '',
    birthDate: patient?.birthDate || '',
    gender: patient?.gender || 'O',
    address: patient?.address || {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    medicalHistory: patient?.medicalHistory || [],
    allergies: patient?.allergies || []
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        {patient ? "Editar paciente" : "Nuevo paciente"}
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
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            label="Teléfono"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
          />
          <TextField
            label="Fecha de nacimiento"
            name="birthDate"
            type="date"
            value={formData.birthDate}
            onChange={handleChange}
            required
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            select
            label="Género"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <MenuItem value="M">Masculino</MenuItem>
            <MenuItem value="F">Femenino</MenuItem>
            <MenuItem value="O">Otro</MenuItem>
          </TextField>
          <Button type="submit" variant="contained" color="primary">
            {patient ? "Guardar cambios" : "Crear paciente"}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default PatientForm;
