import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService, { User, UserRole } from '../modules/auth/authService';

interface AuthContextType {
  user: User | null;
  login: (username: string, role: UserRole) => void;
  logout: () => void;
  isAuthorized: (requiredRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si hay una sesión activa al cargar
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const login = (username: string, role: UserRole) => {
    const loggedUser = AuthService.login(username, role);
    setUser(loggedUser);
    navigate('/');
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    navigate('/login');
  };

  const isAuthorized = (requiredRoles: UserRole[]): boolean => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthorized }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Componente HOC para proteger rutas
export const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requiredRoles: UserRole[];
}> = ({ children, requiredRoles }) => {
  const { user, isAuthorized } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (!isAuthorized(requiredRoles)) {
      navigate('/');
    }
  }, [user, requiredRoles, navigate, isAuthorized]);

  if (!user || !isAuthorized(requiredRoles)) {
    return null;
  }

  return <>{children}</>;
}; 