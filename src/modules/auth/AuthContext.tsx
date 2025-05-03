import React, { createContext, useContext, useState, useCallback } from 'react';
import { AuthContextType, LoginCredentials, User } from './types';
import { TEST_USERS } from '../../core/config/constants';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'aiduxcare_auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<Omit<AuthContextType, 'login' | 'logout'>>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        user: parsed.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    }
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    };
  });

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const testUser = TEST_USERS.find(user => 
        user.email === credentials.email && user.password === credentials.password
      );

      if (testUser) {
        const user: User = {
          email: testUser.email,
          name: testUser.name,
          role: testUser.role
        };
        
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ user }));
      } else {
        throw new Error('Credenciales inválidas');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error de autenticación'
      }));
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
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