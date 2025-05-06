import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from '@/core/context/AuthContext';
import Navbar from './Navbar';
import Sidebar from '@/components/layout/Sidebar';

const Layout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {isAuthenticated && <Navbar />}
      <Box sx={{ 
        display: 'flex', 
        flexGrow: 1,
        minHeight: 0 // Importante para evitar desbordamiento
      }}>
        {isAuthenticated && <Sidebar />}
        <Box component="main" sx={{ 
          flexGrow: 1,
          p: 3,
          overflowY: 'auto'
        }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout; 