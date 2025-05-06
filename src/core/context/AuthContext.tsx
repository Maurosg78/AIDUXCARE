import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackEvent } from "@/core/lib/langfuse.client";

interface User {
  email: string;
  name?: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    return null;
  });

  const navigate = useNavigate();

  const loginWithRole = useCallback((role: string) => {
    const mockUser = mockUsersByRole[role];
    if (mockUser) {
      setUser(mockUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
      navigate('/dashboard');
    }
  }, [navigate]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    navigate('/');
  }, [navigate]);

  const value = {
    user,
    isAuthenticated: !!user,
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

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate('/login');
  }

  return isAuthenticated ? <>{children}</> : null;
} 