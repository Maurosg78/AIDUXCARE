import React from 'react';
import Login from '@/components/auth/Login';
import { Box } from '@mui/material';

export default function LoginPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default'
      }}
    >
      <Login />
    </Box>
  );
} 