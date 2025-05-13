import React from 'react';
import { Paper, Typography, Divider, Grid } from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MCPContext } from '../../core/mcp/CopilotContextBuilder';

interface CurrentVisitCardProps {
  visitMetadata: MCPContext['visit_metadata'];
}

export const CurrentVisitCard: React.FC<CurrentVisitCardProps> = ({ visitMetadata }) => {
  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Visita Actual
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary">
            Fecha y Hora
          </Typography>
          <Typography variant="body1">
            {format(new Date(visitMetadata.date), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary">
            Profesional
          </Typography>
          <Typography variant="body1">
            {visitMetadata.professional}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary">
            ID de Visita
          </Typography>
          <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
            {visitMetadata.visit_id}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
}; 