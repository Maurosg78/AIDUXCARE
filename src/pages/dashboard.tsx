import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from "@/core/context/AuthContext";
import { Grid, Card, CardContent, Typography, Box, CircularProgress } from "@mui/material";
import { useMemo } from "react";
import { 
  AssignmentTurnedIn, 
  Analytics, 
  DataUsage, 
  VerifiedUser 
} from "@mui/icons-material";
import ClinicalLogbook from "@/modules/emr/components/ClinicalLogbook";

interface Visit {
  id: string;
  userEmail: string;
  motivo: string;
  diagnosticoFisioterapeutico: string;
  tratamientoPropuesto: string;
  status: string;
  langfuseEvents: number;
  date: string;
  [key: string]: string | number; // Índice de firma para acceso dinámico
}

// Mock de visitas para desarrollo
const mockVisits: Visit[] = [
  {
    id: "1",
    userEmail: "mauricio@aiduxcare.ai",
    motivo: "Dolor lumbar crónico",
    diagnosticoFisioterapeutico: "Lumbalgia mecánica",
    tratamientoPropuesto: "Ejercicios de estabilización",
    status: "completed",
    langfuseEvents: 5,
    date: "2024-03-15"
  },
  {
    id: "2",
    userEmail: "mauricio@aiduxcare.ai",
    motivo: "Cervicalgia",
    diagnosticoFisioterapeutico: "",
    tratamientoPropuesto: "Terapia manual",
    status: "completed",
    langfuseEvents: 3,
    date: "2024-03-16"
  },
  {
    id: "3",
    userEmail: "otro@aiduxcare.ai",
    motivo: "Esguince tobillo",
    diagnosticoFisioterapeutico: "Esguince grado II",
    tratamientoPropuesto: "RICE protocol",
    status: "completed",
    langfuseEvents: 4,
    date: "2024-03-17"
  }
];

interface MetricCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
}

const MetricCard = ({ icon, value, label, color }: MetricCardProps) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ 
          p: 1, 
          borderRadius: 1, 
          bgcolor: `${color}15`,
          color: color,
          mr: 2 
        }}>
          {icon}
        </Box>
      </Box>
      <Typography variant="h4" component="div" gutterBottom>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </CardContent>
  </Card>
);

const roleRedirects = {
  professional: '/dashboard/professional',
  secretary: '/dashboard/secretary',
  admin: '/dashboard/admin',
  developer: '/dashboard/dev'
};

const DashboardRedirect: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !user.role) {
      return;
    }

    const targetPath = roleRedirects[user.role as keyof typeof roleRedirects];
    
    if (targetPath) {
      navigate(targetPath, { replace: true });
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!roleRedirects[user.role as keyof typeof roleRedirects]) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        gap: 2 
      }}>
        <Typography variant="h5" color="error">
          Rol no reconocido
        </Typography>
        <Typography>
          Por favor, contacta con el administrador del sistema.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  );
};

export default DashboardRedirect; 