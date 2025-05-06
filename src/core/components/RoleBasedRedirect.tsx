import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { z } from 'zod';

// Esquema de validación para roles
const RoleSchema = z.enum(['admin', 'healthcare', 'secretary', 'developer', 'fisioterapeuta']);
type Role = z.infer<typeof RoleSchema>;

// Componente de redirección basado en rol
const RoleBasedRedirect: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  try {
    const role = RoleSchema.parse(user.role);
    switch (role) {
      case 'healthcare':
      case 'fisioterapeuta':
        return <Navigate to="/professional/dashboard" />;
      case 'admin':
        return <Navigate to="/admin/dashboard" />;
      case 'secretary':
        return <Navigate to="/secretary/dashboard" />;
      case 'developer':
        return <Navigate to="/developer/dashboard" />;
      default:
        return <Navigate to="/login" />;
    }
  } catch (error) {
    console.error('Error de validación de rol:', error);
    return <Navigate to="/login" />;
  }
};

export default RoleBasedRedirect;

// Exportar tipos y utilidades para facilitar extensibilidad
export type { Role };
export { RoleSchema }; 