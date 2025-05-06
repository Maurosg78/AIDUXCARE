import { useEffect } from 'react';
import { useAuth } from '@/core/context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else if (!isLoading) {
      navigate('/auth/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Mientras se verifica la autenticación, mostrar loading
  if (isLoading) {
    return (
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  // Redirección inmediata si ya conocemos el estado
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/auth/login" replace />;
}
