import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from './authService';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<UserRole>('fisioterapeuta');
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      login(username, role);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box 
        component="main"
        sx={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        <Card 
          component="section"
          sx={{ width: '100%' }}
          aria-labelledby="login-title"
        >
          <CardContent>
            <Typography 
              id="login-title"
              variant="h5" 
              component="h1" 
              gutterBottom 
              align="center"
            >
              AiDuxCare
            </Typography>
            <Typography 
              variant="subtitle1" 
              gutterBottom 
              align="center" 
              color="text.secondary"
              id="login-description"
            >
              Iniciar Sesión
            </Typography>

            <Box 
              component="form" 
              onSubmit={handleSubmit} 
              sx={{ mt: 3 }}
              aria-describedby="login-description"
            >
              <TextField
                fullWidth
                label="Nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                margin="normal"
                required
                id="username-input"
                aria-required="true"
                inputProps={{
                  'aria-label': 'Nombre de usuario'
                }}
              />

              <FormControl fullWidth margin="normal">
                <InputLabel id="role-select-label">Rol</InputLabel>
                <Select
                  labelId="role-select-label"
                  value={role}
                  label="Rol"
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  id="role-select"
                  aria-label="Seleccionar rol"
                >
                  <MenuItem value="fisioterapeuta">Fisioterapeuta</MenuItem>
                  <MenuItem value="auditor">Auditor</MenuItem>
                  <MenuItem value="admin">Administrador</MenuItem>
                </Select>
              </FormControl>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={!username.trim()}
                aria-label="Iniciar sesión"
              >
                Iniciar Sesión
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default LoginPage; 