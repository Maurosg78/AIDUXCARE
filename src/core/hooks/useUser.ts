import { useState, useEffect } from 'react';
import { User, UserRole } from '../types/UserRoles';

/**
 * Hook temporal que simula la autenticación de usuario
 * TODO: Reemplazar con autenticación real
 */
export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [_error, _setError] = useState<Error | null>(null);

  useEffect(() => {
    // Simular carga de usuario
    const mockUser: User = {
      id: 'uuid-mock-user',
      full_name: 'Mauricio Sobarzo',
      email: 'mauricio@axonvalencia.es',
      role: UserRole.PROFESSIONAL,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      is_active: true
    };

    setTimeout(() => {
      setUser(mockUser);
      setLoading(false);
    }, 500); // Simular delay de red
  }, []);

  const updateUserRole = (newRole: UserRole) => {
    if (user) {
      setUser({ ...user, role: newRole });
    }
  };

  return {
    user,
    loading,
    error: _error,
    updateUserRole // Función temporal para testing
  };
}; 