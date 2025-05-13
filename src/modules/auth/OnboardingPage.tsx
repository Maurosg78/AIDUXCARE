import React from 'react';
import { Link } from '@/core/utils/router';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  AccountCircle,
  EventNote,
  LocalHospital,
  NotificationsActive,
} from '@mui/icons-material';

const OnboardingPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Bienvenido a AiDuxCare
        </Typography>
        <Typography variant="h5" align="center" color="textSecondary" paragraph>
          La plataforma inteligente para optimizar la atención clínica
        </Typography>

        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" gutterBottom>
                Primeros pasos
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <AccountCircle />
                  </ListItemIcon>
                  <ListItemText
                    primary="Completa tu perfil"
                    secondary="Añade tu información profesional para personalizar tu experiencia"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <EventNote />
                  </ListItemIcon>
                  <ListItemText
                    primary="Configura tu agenda"
                    secondary="Establece tus horarios y disponibilidad"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocalHospital />
                  </ListItemIcon>
                  <ListItemText
                    primary="Explora el módulo clínico"
                    secondary="Familiarízate con las herramientas de diagnóstico y seguimiento"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <NotificationsActive />
                  </ListItemIcon>
                  <ListItemText
                    primary="Configura tus notificaciones"
                    secondary="Personaliza cómo quieres recibir alertas y recordatorios"
                  />
                </ListItem>
              </List>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h5" gutterBottom>
                Características principales
              </Typography>
              <Typography paragraph>
                AiDuxCare integra las últimas tecnologías de inteligencia artificial para:
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <li>Asistencia en tiempo real durante consultas</li>
                <li>Sugerencias de diagnóstico basadas en evidencia</li>
                <li>Documentación clínica inteligente</li>
                <li>Análisis predictivo para mejorar resultados</li>
                <li>Recordatorios de seguimiento automatizados</li>
              </Box>
              
              <Box mt={4} display="flex" justifyContent="center">
                <Button
                  component={Link}
                  to="/dashboard"
                  variant="contained"
                  color="primary"
                  size="large"
                >
                  Ir al Dashboard
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default OnboardingPage; 