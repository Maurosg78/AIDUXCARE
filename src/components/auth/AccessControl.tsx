import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/core/contexts/AuthContext';
import type { UserRole } from '@/core/types/supabase';
import { CircularProgress, Box } from '@mui/material';

interface AccessControlProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export default function AccessControl({ children, allowedRoles }: AccessControlProps) {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }

    if (!loading && userRole && !allowedRoles.includes(userRole)) {
      // Redirigir a la página correspondiente según el rol
      if (userRole === 'admin') {
        router.push('/admin/dashboard');
      } else if (userRole === 'professional') {
        router.push('/professional/dashboard');
      } else if (userRole === 'patient') {
        router.push('/patient/dashboard');
      }
    }
  }, [loading, user, userRole, allowedRoles, router]);

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

  if (!user || !userRole || !allowedRoles.includes(userRole)) {
    return null;
  }

  return <>{children}</>;
} 