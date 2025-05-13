import { useEffect  } from 'react';
import { useAuth } from '@/core/context/AuthContext';
import { Navigate } from '@/core/utils/router';

interface AccessControlProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const AccessControl: React.FC<AccessControlProps> = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/professional/dashboard" replace />;
  }

  return <>{children}</>;
}; 