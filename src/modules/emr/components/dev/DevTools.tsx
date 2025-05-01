import React from 'react';
import { Box, Button, Typography } from '@mui/material';

const DevTools: React.FC = () => {
  const isDev = import.meta.env.DEV || false;
  
  if (!isDev) {
    return null;
  }

  return (
    <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom>
        Dev Tools
      </Typography>
      <Button variant="contained" color="primary" onClick={() => console.log('Dev action')}>
        Test Action
      </Button>
    </Box>
  );
};

export default DevTools;
