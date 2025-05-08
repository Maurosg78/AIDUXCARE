import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { trackEvent } from "@/core/lib/langfuse.client";
import { CircularProgress, Box } from '@mui/material';
import authClient from '@/core/lib/authClient';

interface User {
  email: string;
  name?: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => boolean;
  loginWithRole: (role: string) => void;
  logout: () => void;
}

const STORAGE_KEY = 'aiduxcare_auth';
const VALID_CREDENTIALS = [
  {
    email: 'mauricio@axonvalencia.es',
    password: 'Test1234!',
    name: 'Mauricio Sobarzo',
    role: 'fisioterapeuta'
  },
  {
    email: 'admin@aiduxcare.com',
    password: 'Admin1234!',
    name: 'Administrador',
    role: 'admin'
  }
] as const;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock de usuarios por rol para desarrollo
const mockUsersByRole: Record<string, User> = {
  professional: {
    email: 'doctor@aiduxcare.ai',
    name: 'Dr. García',
    role: 'professional'
  },
  secretary: {
    email: 'secretaria@aiduxcare.ai',
    name: 'Ana Martínez',
    role: 'secretary'
  },
  admin: {
    email: 'admin@aiduxcare.ai',
    name: 'Carlos Admin',
    role: 'admin'
  },
  developer: {
    email: 'dev@aiduxcare.ai',
    name: 'Dev Team',
    role: 'developer'
  }
};

const getDashboardRoute = (role: string): string => {
  switch (role) {
    case 'professional':
    case 'fisioterapeuta':
      return '/professional/dashboard';
    case 'admin':
      return '/admin/dashboard';
    case 'secretary':
      return '/secretary/dashboard';
    case 'developer':
      return '/developer/dashboard';
    default:
      return '/';
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Gestionar cambios de sesión de Supabase
  useEffect(() => {
    const { data: listener } = authClient.onAuthStateChange((event, session) => {
      if (session?.user) {
        // Usuario autenticado en Supabase
        const userData = {
          email: session.user.email || 'unknown',
          name: session.user.user_metadata?.name,
          role: session.user.user_metadata?.role || 'user'
        };
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        // No hay sesión activa
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Restaurar usuario al inicio
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedUser = JSON.parse(stored);
        console.log('Restaurando usuario:', parsedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error al restaurar usuario:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  // Manejar redirecciones basadas en autenticación
  useEffect(() => {
    if (!loading && user) {
      // Solo redirigir si estamos en la página de inicio o login
      if (location.pathname === '/' || location.pathname === '/login') {
        const route = getDashboardRoute(user.role);
        console.log('Redirigiendo a:', route);
        navigate(route);
      }
    }
  }, [user, loading, navigate, location]);

  const login = useCallback((email: string, password: string) => {
    console.log('Intentando login con:', { email });
    
    const validUser = VALID_CREDENTIALS.find(
      cred => cred.email === email && cred.password === password
    );

    console.log('Usuario encontrado:', validUser);

    if (validUser) {
      const userData = {
        email: validUser.email,
        name: validUser.name,
        role: validUser.role
      };
      console.log('Estableciendo usuario:', userData);
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      return true;
    }
    return false;
  }, []);

  const loginWithRole = useCallback((role: string) => {
    console.log('Intentando loginWithRole:', role);
    const mockUser = mockUsersByRole[role];
    if (mockUser) {
      console.log('Usuario mock encontrado:', mockUser);
      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    }
  }, []);

  const logout = useCallback(() => {
    console.log('Cerrando sesión');
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(STORAGE_KEY);
    navigate('/login');
  }, [navigate]);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    loginWithRole,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function ProtectedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth/login', { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    console.log('Rol no permitido:', {
      userRole: user?.role,
      allowedRoles
    });
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Rol no reconocido</h1>
        <p className="text-gray-600">Por favor, contacta con el administrador del sistema.</p>
      </div>
    );
  }

  return <>{children}</>;
} 