import React from 'react';
import { Box, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link as RouterLink } from '@/core/utils/router';
import { useAuth } from '@/core/context/AuthContext';

const Navbar: React.FC = () => {
  const { user } = useAuth();
  const isDev = import.meta.env.MODE === 'development';

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          AiDuxCare
        </Typography>
        
        {isDev && (
          <Box sx={{ mx: 2 }}>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/dashboard/professional"
              sx={{ mx: 1 }}
            >
              Professional
            </Button>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/dashboard/secretary"
              sx={{ mx: 1 }}
            >
              Secretary
            </Button>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/dashboard/admin"
              sx={{ mx: 1 }}
            >
              Admin
            </Button>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/dashboard/dev"
              sx={{ mx: 1 }}
            >
              Dev
            </Button>
          </Box>
        )}

        <Typography variant="subtitle2" sx={{ mx: 2 }}>
          {user?.email}
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 