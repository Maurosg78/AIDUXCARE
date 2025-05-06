import React, { useState } from 'react';
import { Box, Button, Card, CardContent, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { useAuth } from '@/core/context/AuthContext';
import { useTranslation } from 'react-i18next';

const MockLogin: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const { loginWithRole } = useAuth();
  const { t } = useTranslation();

  const handleLogin = () => {
    if (selectedRole) {
      loginWithRole(selectedRole);
    }
  };

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      bgcolor: 'grey.100'
    }}>
      <Card sx={{ maxWidth: 400, width: '100%', mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom align="center">
            {t('auth.mock_login_title')}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }} align="center">
            {t('auth.mock_login_description')}
          </Typography>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="role-select-label">
              {t('auth.select_role')}
            </InputLabel>
            <Select
              labelId="role-select-label"
              value={selectedRole}
              label={t('auth.select_role')}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <MenuItem value="professional">{t('roles.professional')}</MenuItem>
              <MenuItem value="secretary">{t('roles.secretary')}</MenuItem>
              <MenuItem value="admin">{t('roles.admin')}</MenuItem>
              <MenuItem value="developer">{t('roles.developer')}</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            fullWidth
            onClick={handleLogin}
            disabled={!selectedRole}
          >
            {t('auth.login')}
          </Button>

          {process.env.NODE_ENV === 'development' && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }} align="center">
              {t('auth.mock_login_dev_note')}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default MockLogin; 