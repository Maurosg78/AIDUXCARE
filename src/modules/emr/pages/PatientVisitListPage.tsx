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
  ListItemSecondaryAction
} from "@mui/material";
import { ArrowBack as ArrowBackIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import VisitService from "../services/VisitService";
import { PatientVisit } from "../models/PatientVisit";

const PatientVisitListPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [visits, setVisits] = useState<PatientVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVisits = async () => {
      if (!patientId) {
        setError("ID de paciente no proporcionado");
        setLoading(false);
        return;
      }

      try {
        const result = await VisitService.getByPatientId(patientId);
        setVisits(result);
      } catch (err) {
        setError("Error al cargar las visitas");
      } finally {
        setLoading(false);
      }
    };
    fetchVisits();
  }, [patientId]);

  const handleNewVisit = () => {
    navigate(`/patients/${patientId}/visits/new`);
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleViewVisit = (visitId: string) => {
    navigate(`/patients/${patientId}/visits/${visitId}`);
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
          <Typography variant="h4">Visitas del paciente</Typography>
        </Stack>

        <Button 
          variant="contained" 
          onClick={handleNewVisit}
          sx={{ alignSelf: 'flex-end' }}
        >
          Añadir visita
        </Button>

        {visits.length === 0 ? (
          <Alert severity="info">
            No hay visitas registradas para este paciente
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
      </Stack>
    </Container>
  );
};

export default PatientVisitListPage;

