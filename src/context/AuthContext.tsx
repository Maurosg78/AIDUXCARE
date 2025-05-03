import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService, { User, UserRole } from '../modules/auth/authService';

// Definimos los tipos
export type UserRole = 'admin' | 'doctor' | 'nurse';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Proveedor del contexto
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Intenta cargar usuario del localStorage al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Función de login simulada
  const login = async (email: string, password: string): Promise<boolean> => {
    // En producción, esto sería una llamada a la API
    // Simular verificación de credenciales (solo para demo)
    if (email === 'demo@example.com' && password === 'password123') {
      const mockUser: User = {
        id: '1',
        name: 'Usuario Demo',
        email: 'demo@example.com',
        role: 'doctor',
      };

      // Guardar en localStorage para persistencia
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      setUser(mockUser);
      setIsAuthenticated(true);
      navigate('/');
      return true;
    }
    
    // Credenciales de admin para pruebas
    if (email === 'admin@example.com' && password === 'admin123') {
      const mockUser: User = {
        id: '2',
        name: 'Administrador',
        email: 'admin@example.com',
        role: 'admin',
      };

      localStorage.setItem('user', JSON.stringify(mockUser));
      
      setUser(mockUser);
      setIsAuthenticated(true);
      navigate('/');
      return true;
    }

    return false;
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  const value = {
    user,
    isAuthenticated,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}

// Componente HOC para proteger rutas
export const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requiredRoles: UserRole[];
}> = ({ children, requiredRoles }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (!requiredRoles.includes(user.role)) {
      navigate('/');
    }
  }, [user, requiredRoles, navigate, isAuthenticated]);

  if (!user || !isAuthenticated || !requiredRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}; 