import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import AccessControl from '@/components/auth/AccessControl';

const DashboardDev: React.FC = () => {
  const { t } = useTranslation();

  return (
    <AccessControl allowedRoles={['developer']}>
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t('dashboard.title', { role: t('roles.developer') })}
        </Typography>
        <Typography variant="subtitle1">
          {t('dashboard.dev')}
        </Typography>
      </Box>
    </AccessControl>
  );
};

export default DashboardDev; 