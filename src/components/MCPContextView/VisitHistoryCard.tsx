import React from 'react';
import { Paper, Typography, Divider, List, ListItem, ListItemText } from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MCPContext } from '../../core/mcp/CopilotContextBuilder';

interface VisitHistoryCardProps {
  enrichment?: MCPContext['enrichment'];
}

export const VisitHistoryCard: React.FC<VisitHistoryCardProps> = ({ enrichment }) => {
  const visits = enrichment?.emr?.visit_history || [];
  const recentVisits = visits.slice(0, 3); // Mostrar solo las últimas 3 visitas

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Historial de Visitas
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {recentVisits.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No hay visitas previas registradas
        </Typography>
      ) : (
        <List>
          {recentVisits.map((visit, index) => (
            <ListItem key={visit.id} divider={index < recentVisits.length - 1}>
              <ListItemText
                primary={
                  <Typography variant="subtitle2">
                    {format(new Date(visit.date), "d 'de' MMMM 'de' yyyy", { locale: es })}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography variant="body2" color="text.secondary">
                      Tipo: {visit.type}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {visit.summary}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Profesional: {visit.professional}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
}; 