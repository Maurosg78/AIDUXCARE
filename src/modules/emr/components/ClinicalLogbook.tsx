import React, { useState } from 'react';
import { 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  IconButton,
  TextField,
  Box,
  Button
} from '@mui/material';
import { 
  Visibility, 
  Edit,
  Check,
  AccessTime
} from '@mui/icons-material';
import { useNavigate } from '@/core/utils/router';

interface LogbookEntry {
  visitId: string;
  patientName: string;
  professionalEmail: string;
  timestamp: string;
  qualityScore: 'bajo' | 'medio' | 'alto';
  observations: string;
}

// Mock de datos inicial
const logbookEntries: LogbookEntry[] = [
  {
    visitId: "visit-001",
    patientName: "Paciente controlado #1",
    professionalEmail: "mauricio@aiduxcare.ai",
    timestamp: "2025-05-07T10:30:00Z",
    qualityScore: "medio",
    observations: "Flujo muy fluido, copiloto sugirió omisión en diagnóstico y fue acertado. Paciente con múltiples patologías, principalmente dolor lumbar crónico y artrosis de rodilla. La experiencia en entorno doméstico fue positiva."
  },
  {
    visitId: "visit-002",
    patientName: "Paciente controlado #1",
    professionalEmail: "mauricio@aiduxcare.ai",
    timestamp: "2025-05-07T16:45:00Z",
    qualityScore: "alto",
    observations: "Segunda visita del día. Mejora notable en la captura de datos. El copiloto detectó relación entre dolor y actividad física previa."
  }
];

interface EditableObservationProps {
  value: string;
  onSave: (newValue: string) => void;
}

const EditableObservation: React.FC<EditableObservationProps> = ({ value, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
        <TextField
          multiline
          rows={3}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          size="small"
          fullWidth
        />
        <IconButton onClick={handleSave} color="primary" size="small">
          <Check />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="body2" sx={{ flex: 1 }}>
        {value}
      </Typography>
      <IconButton onClick={() => setIsEditing(true)} size="small">
        <Edit />
      </IconButton>
    </Box>
  );
};

const getQualityColor = (score: string) => {
  switch (score) {
    case 'bajo': return '#ef4444';
    case 'medio': return '#f59e0b';
    case 'alto': return '#22c55e';
    default: return '#64748b';
  }
};

export default function ClinicalLogbook() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState(logbookEntries);

  const handleObservationUpdate = (visitId: string, newObservation: string) => {
    setEntries(entries.map(entry => 
      entry.visitId === visitId 
        ? { ...entry, observations: newObservation }
        : entry
    ));
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 4 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AccessTime /> Bitácora Clínica
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Registro de casos clínicos documentados en entorno controlado
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha y Hora</TableCell>
              <TableCell>Paciente</TableCell>
              <TableCell>Profesional</TableCell>
              <TableCell>Calidad</TableCell>
              <TableCell>Observaciones</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.visitId}>
                <TableCell>{formatDate(entry.timestamp)}</TableCell>
                <TableCell>{entry.patientName}</TableCell>
                <TableCell>{entry.professionalEmail}</TableCell>
                <TableCell>
                  <Chip 
                    label={entry.qualityScore.toUpperCase()}
                    size="small"
                    sx={{ 
                      bgcolor: `${getQualityColor(entry.qualityScore)}15`,
                      color: getQualityColor(entry.qualityScore),
                      fontWeight: 500
                    }}
                  />
                </TableCell>
                <TableCell sx={{ maxWidth: 400 }}>
                  <EditableObservation
                    value={entry.observations}
                    onSave={(newValue) => handleObservationUpdate(entry.visitId, newValue)}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton 
                    onClick={() => navigate(`/visits/${entry.visitId}`)}
                    color="primary"
                    size="small"
                  >
                    <Visibility />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="outlined" 
          size="small"
          onClick={() => navigate('/visits')}
        >
          Ver Todas las Visitas
        </Button>
      </Box>
    </Paper>
  );
} 