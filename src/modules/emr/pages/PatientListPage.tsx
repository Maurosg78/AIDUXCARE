import React from 'react';
import { usePatients } from '@/hooks/usePatients';
import { Box, Typography, Paper, List, ListItem, ListItemText, CircularProgress, Button } from '@mui/material';
import type { Patient  } from '@/core/types';

const PatientListPage = () => {
  const { patients, isLoading, error } = usePatients();

  // Navegación con window.location en lugar de useNavigate
  const navigateTo = (path: string) => {
    window.location.href = path;
  };

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
            {patients.map((patient: Patient) => (
              <ListItem
                key={patient.id}
                divider
                button
                onClick={() => navigateTo(`/patients/${patient.id}/visits`)}
              >
                <ListItemText
                  primary={`${patient.firstName} ${patient.lastName}`}
                  secondary={`Ingreso: ${new Date(patient.createdAt).toLocaleDateString()}`}
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
          onClick={() => navigateTo('/professional/dashboard')}
        >
          Volver al Dashboard
        </Button>
      </Box>
    </Box>
  );
};

export default PatientListPage;

