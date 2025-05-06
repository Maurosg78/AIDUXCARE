import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AccessControl } from '@/core/components/AccessControl';

const DashboardProfessional: React.FC = () => {
  const { t } = useTranslation();

  return (
    <AccessControl allowedRoles={['professional']}>
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t('dashboard.title', { role: t('roles.professional') })}
        </Typography>
        <Typography variant="subtitle1">
          {t('dashboard.professional')}
        </Typography>
      </Box>
    </AccessControl>
  );
};

export default DashboardProfessional; 