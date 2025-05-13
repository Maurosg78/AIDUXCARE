import { useEffect, useState  } from 'react';
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
import PatientService from '@/core/services/patient/PatientService';
import VisitService from '@/core/services/visit/VisitService';
import type { Patient, Visit  } from '@/core/types';

// Función para extraer ID del paciente de la URL
const getPatientIdFromUrl = (): string | null => {
  const match = window.location.pathname.match(/\/patients\/([^/]+)/);
  return match ? match[1] : null;
};

// Función para navegar
const navigateTo = (path: string) => {
  window.location.href = path;
};

const PatientVisitListPage: React.FC = () => {
  const patientId = getPatientIdFromUrl();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewVisitDialogOpen, setIsNewVisitDialogOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [isNewPatientDialogOpen, setIsNewPatientDialogOpen] = useState(false);
  const [newPatient, setNewPatient] = useState<Partial<Patient>>({
    name: "",
    firstName: "",
    lastName: "",
    birthDate: "",
    gender: "other",
    email: "",
    phone: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [visitsResult, patientsResult] = await Promise.all([
          VisitService.getAll(),
          PatientService.getAll()
        ]);
        
        // Filtrar visitas por patientId si está presente
        const filteredVisits = patientId 
          ? visitsResult.filter((visit: Visit) => visit.patientId === patientId)
          : visitsResult;
          
        setVisits(filteredVisits);
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
      navigateTo(`/patients/${patientId}/visits/new`);
    } else {
      setIsNewVisitDialogOpen(true);
    }
  };

  const handleNewVisitConfirm = () => {
    if (selectedPatientId) {
      navigateTo(`/patients/${selectedPatientId}/visits/new`);
      setIsNewVisitDialogOpen(false);
    }
  };

  const handleNewPatient = () => {
    setIsNewPatientDialogOpen(true);
    setIsNewVisitDialogOpen(false);
  };

  const handleNewPatientSubmit = async () => {
    try {
      const createdPatient = await PatientService.create({
        ...newPatient,
        id: crypto.randomUUID()
      } as Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>);
      
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
    navigateTo('/dashboard');
  };

  const handleViewVisit = (visitId: string) => {
    navigateTo(`/visits/${visitId}`);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Fecha no disponible';
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
                    primary={visit.type || 'Visita sin tipo'}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {formatDate(visit.visitDate || visit.date)}
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
                  onChange={(e) => setSelectedPatientId(e.target.value as string)}
                  label="Paciente"
                >
                  {patients.map((patient) => (
                    <MenuItem key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName || patient.name}
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
              disabled={!selectedPatientId}
              variant="contained"
            >
              Continuar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo de creación de paciente */}
        <Dialog open={isNewPatientDialogOpen} onClose={() => setIsNewPatientDialogOpen(false)}>
          <DialogTitle>Crear Nuevo Paciente</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2, minWidth: 400 }}>
              <TextField 
                label="Nombre" 
                value={newPatient.firstName || ''}
                onChange={(e) => setNewPatient({...newPatient, firstName: e.target.value})}
                fullWidth
              />
              <TextField 
                label="Apellidos" 
                value={newPatient.lastName || ''}
                onChange={(e) => setNewPatient({...newPatient, lastName: e.target.value})}
                fullWidth
              />
              <TextField 
                label="Email" 
                type="email"
                value={newPatient.email || ''}
                onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                fullWidth
              />
              <TextField 
                label="Teléfono" 
                value={newPatient.phone || ''}
                onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
                fullWidth
              />
              <TextField 
                label="Fecha de Nacimiento"
                type="date"
                value={newPatient.birthDate || ''}
                onChange={(e) => setNewPatient({...newPatient, birthDate: e.target.value})}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Género</InputLabel>
                <Select
                  value={newPatient.gender || 'other'}
                  onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}
                  label="Género"
                >
                  <MenuItem value="male">Masculino</MenuItem>
                  <MenuItem value="female">Femenino</MenuItem>
                  <MenuItem value="other">Otro</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsNewPatientDialogOpen(false)}>Cancelar</Button>
            <Button 
              onClick={handleNewPatientSubmit}
              disabled={!newPatient.firstName || !newPatient.lastName} 
              variant="contained"
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

