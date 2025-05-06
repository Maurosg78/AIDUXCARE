import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  Button, 
  Stack, 
  Container,
  Alert,
  IconButton,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box
} from "@mui/material";
import { ArrowBack as ArrowBackIcon, Visibility as VisibilityIcon, Add as AddIcon } from '@mui/icons-material';
import VisitService from "../services/VisitService";
import PatientService from "../services/PatientService";
import { PatientVisit } from "../models/PatientVisit";
import { Patient, PatientCreate } from "../models/Patient";

const PatientVisitListPage: React.FC = () => {
  const { patientId } = useParams<{ patientId?: string }>();
  const navigate = useNavigate();
  const [visits, setVisits] = useState<PatientVisit[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewVisitDialogOpen, setIsNewVisitDialogOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [isNewPatientDialogOpen, setIsNewPatientDialogOpen] = useState(false);
  const [newPatient, setNewPatient] = useState<PatientCreate>({
    name: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [visitsResult, patientsResult] = await Promise.all([
          patientId ? VisitService.getByPatientId(patientId) : VisitService.getAll(),
          PatientService.getAll()
        ]);
        setVisits(visitsResult);
        setPatients(patientsResult);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [patientId]);

  const handleNewVisit = () => {
    if (patientId) {
      navigate(`/patients/${patientId}/visits/new`);
    } else {
      setIsNewVisitDialogOpen(true);
    }
  };

  const handleNewVisitConfirm = () => {
    if (selectedPatientId) {
      navigate(`/patients/${selectedPatientId}/visits/new`);
      setIsNewVisitDialogOpen(false);
    }
  };

  const handleNewPatient = () => {
    setIsNewPatientDialogOpen(true);
    setIsNewVisitDialogOpen(false);
  };

  const handleNewPatientSubmit = async () => {
    try {
      const createdPatient = await PatientService.create(newPatient);
      setPatients([...patients, createdPatient]);
      setSelectedPatientId(createdPatient.id);
      setIsNewPatientDialogOpen(false);
      setIsNewVisitDialogOpen(true);
    } catch (error) {
      console.error('Error al crear paciente:', error);
      setError("Error al crear el paciente");
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleViewVisit = (visitId: string) => {
    navigate(`/visits/${visitId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container>
        <Typography>Cargando visitas...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton onClick={handleBack} aria-label="Volver">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">
            {patientId ? 'Visitas del paciente' : 'Todas las visitas'}
          </Typography>
        </Stack>

        <Button 
          variant="contained" 
          onClick={handleNewVisit}
          startIcon={<AddIcon />}
          sx={{ alignSelf: 'flex-end' }}
        >
          {patientId ? 'Añadir visita' : 'Nueva visita'}
        </Button>

        {visits.length === 0 ? (
          <Alert severity="info">
            {patientId 
              ? 'No hay visitas registradas para este paciente'
              : 'No hay visitas registradas en el sistema'
            }
          </Alert>
        ) : (
          <List>
            {visits.map((visit) => (
              <React.Fragment key={visit.id}>
                <ListItem>
                  <ListItemText
                    primary={visit.visitType}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {formatDate(visit.visitDate)}
                        </Typography>
                        {visit.notes && (
                          <Typography component="p" variant="body2">
                            {visit.notes}
                          </Typography>
                        )}
                        <Typography component="span" variant="body2" color="text.secondary">
                          Estado: {visit.status}
                        </Typography>
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      aria-label="Ver detalles"
                      onClick={() => handleViewVisit(visit.id)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}

        {/* Diálogo de selección de paciente */}
        <Dialog open={isNewVisitDialogOpen} onClose={() => setIsNewVisitDialogOpen(false)}>
          <DialogTitle>Seleccionar Paciente</DialogTitle>
          <DialogContent>
            <Box sx={{ minWidth: 300, mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Paciente</InputLabel>
                <Select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  label="Paciente"
                >
                  {patients.map((patient) => (
                    <MenuItem key={patient.id} value={patient.id}>
                      {`${patient.name} ${patient.lastName}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                onClick={handleNewPatient}
                sx={{ mt: 2 }}
                fullWidth
                variant="outlined"
              >
                Crear Nuevo Paciente
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsNewVisitDialogOpen(false)}>Cancelar</Button>
            <Button 
              onClick={handleNewVisitConfirm} 
              variant="contained" 
              disabled={!selectedPatientId}
            >
              Continuar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo de nuevo paciente */}
        <Dialog open={isNewPatientDialogOpen} onClose={() => setIsNewPatientDialogOpen(false)}>
          <DialogTitle>Nuevo Paciente</DialogTitle>
          <DialogContent>
            <Box sx={{ minWidth: 300, mt: 2 }}>
              <Stack spacing={2}>
                <TextField
                  label="Nombre"
                  fullWidth
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                />
                <TextField
                  label="Apellidos"
                  fullWidth
                  value={newPatient.lastName}
                  onChange={(e) => setNewPatient({...newPatient, lastName: e.target.value})}
                />
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  value={newPatient.email}
                  onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                />
                <TextField
                  label="Teléfono"
                  fullWidth
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
                />
                <TextField
                  label="Fecha de Nacimiento"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={newPatient.dateOfBirth}
                  onChange={(e) => setNewPatient({...newPatient, dateOfBirth: e.target.value})}
                />
              </Stack>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsNewPatientDialogOpen(false)}>Cancelar</Button>
            <Button 
              onClick={handleNewPatientSubmit} 
              variant="contained"
              disabled={!newPatient.name || !newPatient.lastName}
            >
              Crear Paciente
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Container>
  );
};

export default PatientVisitListPage;

