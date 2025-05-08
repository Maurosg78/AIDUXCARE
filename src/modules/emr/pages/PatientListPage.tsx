import React from 'react';
import { usePatients } from '@/hooks/usePatients';
import { Box, Typography, Paper, List, ListItem, ListItemText, CircularProgress, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const PatientListPage = () => {
  const { patients, isLoading, error } = usePatients();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h5" color="error">Error al cargar pacientes</Typography>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Lista de Pacientes ({patients.length})
      </Typography>
      
      {patients.length === 0 ? (
        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography>No hay pacientes para mostrar</Typography>
        </Paper>
      ) : (
        <Paper elevation={2}>
          <List>
            {patients.map((patient) => (
              <ListItem
                key={patient.id}
                divider
                button
                onClick={() => navigate(`/patients/${patient.id}/visits`)}
              >
                <ListItemText
                  primary={patient.full_name}
                  secondary={`Ingreso: ${new Date(patient.created_at).toLocaleDateString()} • ${patient.tags.join(', ')}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
      
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="caption" display="block" gutterBottom>
          {patients.length > 0 ? 'Datos cargados correctamente' : 'No se encontraron pacientes'}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          sx={{ mt: 2 }}
          onClick={() => navigate('/professional/dashboard')}
        >
          Volver al Dashboard
        </Button>
      </Box>
    </Box>
  );
};

export default PatientListPage;

