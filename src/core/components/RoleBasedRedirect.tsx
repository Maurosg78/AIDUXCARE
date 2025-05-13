import React from 'react';
import { useAuth } from '@/core/context/AuthContext';
import { Navigate } from '@/core/utils/router';

/**
 * Roles permitidos en la aplicación
 */
export type Role = 
  | 'admin' 
  | 'professional' 
  | 'fisioterapeuta' 
  | 'secretary' 
  | 'guest' 
  | 'patient'
  | 'developer';

interface Props {
  children: React.ReactNode;
  allowedRoles: Role[];
  redirectRoute?: string;
}

/**
 * Componente que redirige basado en roles
 * Si el usuario no tiene un rol autorizado, lo redirige a una ruta específica
 */
export const RoleBasedRedirect: React.FC<Props> = ({
  children,
  allowedRoles,
  redirectRoute = '/unauthorized'
}) => {
  const { user, loading } = useAuth();
  
  // Si está cargando, mostramos un indicador o nada
  if (loading) {
    return null;
  }
  
  // Estado para verificar si el usuario está autorizado
  const isAuthorized = user && 
    user.role && 
    allowedRoles.includes(user.role as Role);
  
  // Si no está autorizado, redirigir
  if (!isAuthorized) {
    return <Navigate to={redirectRoute} />;
  }
  
  // Si está autorizado, mostrar los hijos
  return <>{children}</>;
};

export default RoleBasedRedirect; 