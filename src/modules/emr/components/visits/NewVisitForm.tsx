import { useState  } from 'react';
import { useNavigate } from "react-router";
import { Button, TextField, Grid, MenuItem, Box, Typography, Paper } from "@mui/material";
import { PatientVisit } from "@/modules/emr/models/PatientVisit";
import { v4 as uuid } from "uuid";

interface NewVisitFormProps {
  patientId: string;
}

export default function NewVisitForm({ patientId }: NewVisitFormProps) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<PatientVisit>>({
    patientId,
    visitDate: new Date().toISOString().split('T')[0],
    visitType: "Evaluación inicial",
    status: "scheduled", // Usando el valor correcto del tipo de PatientVisit
    date: new Date().toISOString().split('T')[0],
    type: "Evaluación inicial",
    notes: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Aquí iría la lógica para guardar la visita
      // Por ejemplo:
      // await VisitService.createVisit(formData as PatientVisit);
      
      // Simular creación con ID
      const newVisitId = uuid();
      
      // Redireccionar a la página de detalles de la visita
      navigate(`/visits/${newVisitId}`);
    } catch (err) {
      console.error("Error al crear la visita:", err);
      setError("No se pudo crear la visita. Por favor, inténtelo de nuevo.");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography>{error}</Typography>
        </Paper>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Fecha de visita"
            name="visitDate"
            type="date"
            value={formData.visitDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            select
            label="Tipo de visita"
            name="visitType"
            value={formData.visitType}
            onChange={handleChange}
          >
            <MenuItem value="Evaluación inicial">Evaluación inicial</MenuItem>
            <MenuItem value="Control">Control</MenuItem>
            <MenuItem value="Tratamiento">Tratamiento</MenuItem>
            <MenuItem value="Alta">Alta</MenuItem>
          </TextField>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Notas"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Button 
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
          >
            Crear Visita
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

