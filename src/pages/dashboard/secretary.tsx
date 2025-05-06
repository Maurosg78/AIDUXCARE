import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AccessControl } from '@/core/components/AccessControl';

const DashboardSecretary: React.FC = () => {
  const { t } = useTranslation();

  return (
    <AccessControl allowedRoles={['secretary']}>
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t('dashboard.title', { role: t('roles.secretary') })}
        </Typography>
        <Typography variant="subtitle1">
          {t('dashboard.secretary')}
        </Typography>
      </Box>
    </AccessControl>
  );
};

export default DashboardSecretary; 