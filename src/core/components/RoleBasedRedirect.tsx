import React, { useEffect } from 'react';
import { Navigate } from '@/core/utils/router';
import { useAuth } from '@/core/context/AuthContext';
import { z } from 'zod';

// Esquema de validación para roles
const RoleSchema = z.enum(['admin', 'professional', 'secretary', 'developer', 'fisioterapeuta']);
type Role = z.infer<typeof RoleSchema>;

// Componente de redirección basado en rol
const RoleBasedRedirect: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  try {
    const role = RoleSchema.parse(user.role);
    console.log('Redirigiendo usuario con rol:', role);
    
    switch (role) {
      case 'professional':
      case 'fisioterapeuta':
        return <Navigate to="/professional/dashboard" replace />;
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'secretary':
        return <Navigate to="/secretary/dashboard" replace />;
      case 'developer':
        return <Navigate to="/developer/dashboard" replace />;
      default:
        console.error('Rol no reconocido:', role);
        return <Navigate to="/login" replace />;
    }
  } catch (error) {
    console.error('Error de validación de rol:', error);
    return <Navigate to="/login" replace />;
  }
};

export default RoleBasedRedirect;

// Exportar tipos y utilidades para facilitar extensibilidad
export type { Role };
export { RoleSchema }; 