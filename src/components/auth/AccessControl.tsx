import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/core/context/AuthContext';
import type { UserRole } from '@/core/types/supabase';
import { CircularProgress, Box } from '@mui/material';

interface AccessControlProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

export default function AccessControl({ children, allowedRoles, fallback }: AccessControlProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth/login');
      return;
    }

    if (!loading && user && !allowedRoles.includes(user.role as UserRole)) {
      // Redirigir a la página correspondiente según el rol
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'professional') {
        navigate('/professional/dashboard');
      } else if (user.role === 'patient') {
        navigate('/patient/dashboard');
      }
    }
  }, [loading, user, allowedRoles, navigate]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user || !allowedRoles.includes(user.role as UserRole)) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
} 