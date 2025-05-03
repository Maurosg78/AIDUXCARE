import { ReactNode } from 'react';
import { Navigate, RouteObject } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import NotFound from '../pages/NotFound';
import { useAuth } from '../context/AuthContext';

// Wrapper para rutas protegidas
interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si se requiere admin y el usuario no es admin, redirigir
  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Wrapper para rutas públicas
interface PublicRouteProps {
  children: ReactNode;
}

function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated } = useAuth();

  // Si el usuario ya está autenticado, redirigir al dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Hook personalizado para obtener las rutas
export function useRoutes(): RouteObject[] {
  return [
    {
      path: '/',
      element: <Navigate to="/login" replace />
    },
    {
      path: '/login',
      element: (
        <PublicRoute>
          <Login />
        </PublicRoute>
      )
    },
    {
      path: '/dashboard',
      element: (
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      )
    },
    {
      path: '/admin',
      element: (
        <ProtectedRoute requireAdmin>
          <div className="p-8">
            <h1 className="text-2xl font-bold">Área de Administración</h1>
            <p className="mt-2">Esta área está restringida solo para administradores.</p>
          </div>
        </ProtectedRoute>
      )
    },
    {
      path: '*',
      element: <NotFound />
    }
  ];
} 