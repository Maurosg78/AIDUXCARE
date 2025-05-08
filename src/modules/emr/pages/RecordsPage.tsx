import React from 'react'
import { Card, Typography, CircularProgress, Alert, Box, List, ListItem, ListItemText } from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'

const RecordsPage: React.FC = () => (
  <Box sx={{ padding: '20px' }}>
    <Typography variant="h4" component="h2">Registros Médicos</Typography>
    
    <Card sx={{ marginTop: '20px', padding: '20px' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px 0' }}>
        <CircularProgress sx={{ marginBottom: '20px' }} />
        
        <Alert 
          severity="info" 
          icon={<InfoIcon />}
          sx={{ width: '100%', marginBottom: '20px' }}
        >
          <Typography variant="h6">Módulo en Desarrollo</Typography>
          <Typography variant="body1">
            Este módulo de registros médicos está actualmente en construcción. 
            Pronto podrás visualizar y gestionar todos los registros médicos de los pacientes desde aquí.
          </Typography>
        </Alert>
        
        <Typography variant="h6" sx={{ marginTop: '20px', alignSelf: 'flex-start' }}>
          Características que estarán disponibles próximamente:
        </Typography>
        
        <List sx={{ width: '100%' }}>
          <ListItem>
            <ListItemText primary="Visualización de historial médico completo" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Filtrado por fecha, tipo de registro y profesional" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Exportación de registros en formatos estándar" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Análisis de tendencias y estadísticas" />
          </ListItem>
        </List>
      </Box>
    </Card>
  </Box>
)

export default RecordsPage
