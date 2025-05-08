import React from 'react';
import { Box, Card, CardContent, Typography, Chip, Grid, Link, Tooltip, Divider } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import PersonIcon from '@mui/icons-material/Person';
import type { EvalResult } from '@/mock/evalResults';

// Mapeo de tipos de evaluación a etiquetas más amigables
const EVAL_TYPE_LABELS: Record<string, string> = {
  'diagnostico': 'Diagnóstico',
  'evaluacion': 'Evaluación',
  'tratamiento': 'Tratamiento',
  'seguimiento': 'Seguimiento'
};

// Colores según tipo de evaluación
const EVAL_TYPE_COLORS: Record<string, string> = {
  'diagnostico': '#e3f2fd', // azul claro
  'evaluacion': '#f1f8e9', // verde claro
  'tratamiento': '#fff3e0', // naranja claro
  'seguimiento': '#f3e5f5'  // púrpura claro
};

interface EvalResultsViewerProps {
  results: EvalResult[];
  patientId?: string;
  visitId?: string;
}

/**
 * Componente que muestra los resultados de evaluación clínica
 * Organiza los resultados por tipo y muestra información sobre su origen y estado
 */
const EvalResultsViewer: React.FC<EvalResultsViewerProps> = ({ 
  results, 
  patientId, 
  visitId 
}) => {
  // Filtrar resultados si se proporciona patientId o visitId
  const filteredResults = results.filter(result => {
    if (patientId && result.patientId !== patientId) return false;
    if (visitId && result.visitId !== visitId) return false;
    return true;
  });

  // Agrupar resultados por tipo
  const resultsByType: Record<string, EvalResult[]> = {};
  filteredResults.forEach(result => {
    if (!resultsByType[result.evaluationType]) {
      resultsByType[result.evaluationType] = [];
    }
    resultsByType[result.evaluationType].push(result);
  });

  if (filteredResults.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No hay resultados de evaluación disponibles.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {Object.entries(resultsByType).map(([type, typeResults]) => (
        <Box key={type} sx={{ mb: 3 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 1, 
              color: 'primary.main', 
              borderBottom: '1px solid', 
              borderColor: 'divider',
              pb: 0.5
            }}
          >
            {EVAL_TYPE_LABELS[type] || type}
          </Typography>
          
          <Grid container spacing={2}>
            {typeResults.map(result => (
              <Grid item xs={12} key={result.id}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    backgroundColor: EVAL_TYPE_COLORS[type] || '#f5f5f5',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Box>
                        <Typography variant="subtitle1" gutterBottom>
                          {result.content}
                        </Typography>
                      </Box>
                      <Box>
                        {result.suggestedByAI ? (
                          <Tooltip title="Sugerido por IA">
                            <Chip 
                              icon={<AutoFixHighIcon fontSize="small" />} 
                              label="IA" 
                              size="small" 
                              color="primary" 
                              variant="outlined" 
                            />
                          </Tooltip>
                        ) : (
                          <Tooltip title="Ingresado por profesional">
                            <Chip 
                              icon={<PersonIcon fontSize="small" />} 
                              label="Manual" 
                              size="small" 
                              color="default" 
                              variant="outlined" 
                            />
                          </Tooltip>
                        )}
                        
                        {result.suggestedByAI && result.acceptedByProfessional && (
                          <Tooltip title="Aceptado por profesional">
                            <Chip 
                              icon={<CheckCircleIcon fontSize="small" />} 
                              label="Aceptado" 
                              size="small" 
                              color="success" 
                              sx={{ ml: 1 }} 
                              variant="outlined" 
                            />
                          </Tooltip>
                        )}
                        
                        {result.suggestedByAI && !result.acceptedByProfessional && (
                          <Tooltip title="Rechazado por profesional">
                            <Chip 
                              icon={<CancelIcon fontSize="small" />} 
                              label="Rechazado" 
                              size="small" 
                              color="error" 
                              sx={{ ml: 1 }} 
                              variant="outlined" 
                            />
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(result.timestamp).toLocaleString()}
                      </Typography>
                      
                      {result.sources && result.sources.length > 0 && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Fuentes: 
                            {result.sources.map((source, idx) => (
                              <React.Fragment key={idx}>
                                {idx > 0 && ', '}
                                <Link 
                                  href={source.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  underline="hover"
                                >
                                  {source.name} ({source.year})
                                </Link>
                              </React.Fragment>
                            ))}
                          </Typography>
                        </Box>
                      )}
                      
                      {result.suggestedByAI && (
                        <Tooltip title="Nivel de confianza de la IA">
                          <Chip 
                            label={`${Math.round(result.confidence * 100)}% confianza`} 
                            size="small"
                            color={result.confidence > 0.9 ? "success" : result.confidence > 0.7 ? "primary" : "warning"}
                            variant="outlined"
                          />
                        </Tooltip>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Box>
  );
};

export default EvalResultsViewer; 