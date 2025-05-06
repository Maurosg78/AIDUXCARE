import React from 'react';
import { Alert, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { UserRole, hasAllowedRole } from '../core/types/UserRoles';
import { useUser } from '../core/hooks/useUser';

interface AccessControlProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showLoading?: boolean;
}

/**
 * Componente que controla el acceso a contenido basado en roles de usuario
 */
export const AccessControl: React.FC<AccessControlProps> = ({
  allowedRoles,
  children,
  fallback,
  showLoading = true
}) => {
  const { t } = useTranslation();
  const { user, loading } = useUser();

  if (loading && showLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <CircularProgress />
      </div>
    );
  }

  if (!hasAllowedRole(user, allowedRoles)) {
    return fallback || (
      <Alert severity="error" sx={{ margin: '1rem' }}>
        {t('access.denied')}
      </Alert>
    );
  }

  return <>{children}</>;
}; 