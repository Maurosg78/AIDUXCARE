import React from 'react';
import { Paper, Typography, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Rule as RuleIcon, Info as InfoIcon } from '@mui/icons-material';
import { MCPContext } from '../../core/mcp/CopilotContextBuilder';

interface SystemRulesCardProps {
  rules: MCPContext['rules_and_constraints'];
  instructions: MCPContext['system_instructions'];
}

export const SystemRulesCard: React.FC<SystemRulesCardProps> = ({ rules, instructions }) => {
  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Reglas y Restricciones
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {/* Instrucciones del Sistema */}
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Instrucciones del Sistema
      </Typography>
      <Typography variant="body2" paragraph sx={{ mb: 3 }}>
        {instructions}
      </Typography>

      {/* Reglas y Restricciones */}
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Reglas Activas
      </Typography>
      <List dense>
        {rules.map((rule, index) => (
          <ListItem key={index}>
            <ListItemIcon>
              <RuleIcon color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={rule}
              primaryTypographyProps={{
                variant: 'body2'
              }}
            />
          </ListItem>
        ))}
      </List>

      {/* Nota Informativa */}
      <Divider sx={{ my: 2 }} />
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <InfoIcon fontSize="small" />
        Estas reglas son aplicadas automáticamente por el sistema para garantizar la calidad y seguridad de la atención.
      </Typography>
    </Paper>
  );
}; 