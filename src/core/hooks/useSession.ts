import { useAuth } from '@/core/context/AuthContext';
import type { UserSession  } from '@/core/types';

/**
 * Hook para acceder a la sesión del usuario actual
 * 
 * @returns Objeto con la sesión del usuario y estado de carga
 */
export function useSession(): { 
  session: UserSession | null;
  loading: boolean;
  isAuthenticated: boolean;
} {
  const { user, loading } = useAuth();
  
  return {
    session: user,
    loading,
    isAuthenticated: Boolean(user && !loading)
  };
}

export default useSession; 