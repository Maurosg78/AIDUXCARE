import { useEffect  } from 'react';
import { Routes, Route, Outlet, useParams, useNavigate, useLocation, Link, Navigate, createBrowserRouter, RouterProvider } from '@/core/utils/router';
import { useAuth } from '@/core/context/AuthContext';
import { CircularProgress, Box } from '@mui/material';
import type { UserRole } from '@/types/auth';

interface AccessControlProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

type RouteByRole = Partial<Record<UserRole, string>>;

/**
 * Componente para controlar el acceso a rutas según el rol del usuario
 */
export default function AccessControl({ children, allowedRoles, fallback }: AccessControlProps): JSX.Element {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Definimos las rutas por defecto para cada rol
  const DEFAULT_ROUTES: RouteByRole = {
    admin: '/admin/dashboard',
    professional: '/professional/dashboard',
    patient: '/patient/dashboard',
    // Valores por defecto para los otros roles
    guest: '/',
    fisioterapeuta: '/professional/dashboard',
    secretary: '/admin/dashboard',
    developer: '/admin/dashboard'
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth/login');
      return;
    }

    // Si el usuario no tiene un rol permitido, redirigir a su dashboard por defecto
    if (!loading && user && !allowedRoles.includes(user.role)) {
      const defaultRoute = DEFAULT_ROUTES[user.role] || '/';
      navigate(defaultRoute);
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

  // Si no hay usuario o su rol no está permitido, mostrar fallback o null
  if (!user || !allowedRoles.includes(user.role)) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
} 