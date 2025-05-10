import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router';
import { Home } from '@mui/icons-material';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 3
      }}
    >
      <Typography variant="h1" sx={{ mb: 2, fontSize: '6rem' }}>
        404
      </Typography>
      
      <Typography variant="h4" sx={{ mb: 4 }}>
        Página no encontrada
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Lo sentimos, la página que buscas no existe o ha sido movida.
      </Typography>

      <Button
        variant="contained"
        startIcon={<Home />}
        onClick={() => navigate('/professional/dashboard')}
        size="large"
      >
        Volver al Dashboard
      </Button>
    </Box>
  );
} 