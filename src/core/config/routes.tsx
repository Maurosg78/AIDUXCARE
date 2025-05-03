/**
 * AiDuxCare es un copiloto clínico que se diferencia por:
 * 1. Evaluación en tiempo real de la calidad de las visitas
 * 2. Sugerencias contextuales basadas en evidencia clínica
 * 3. Detección temprana de omisiones o riesgos
 * 4. Integración con sistemas de trazabilidad para auditoría
 * 5. Interfaz adaptativa que se ajusta al flujo de trabajo clínico
 */

import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '../../context/AuthContext';
import LoginPage from '../../modules/auth/LoginPage';
import ImpactDashboard from '../../modules/dashboard/ImpactDashboard';
import PublicImpactDashboard from '../../modules/dashboard/PublicImpactDashboard';
import { UserRole } from '../../modules/auth/authService';
import HomePage from "@/modules/core/pages/HomePage";
import PatientVisitListPage from "@/modules/emr/pages/PatientVisitListPage";
import VisitDetailPage from "@/modules/emr/pages/VisitDetailPage";
import StructuredVisitForm from "@/modules/emr/components/visits/StructuredVisitForm";

const routes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/public-dashboard',
    element: <PublicImpactDashboard />
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute requiredRoles={['admin', 'auditor'] as UserRole[]}>
        <ImpactDashboard />
      </ProtectedRoute>
    )
  },
  {
    path: '/patients',
    element: (
      <ProtectedRoute requiredRoles={['fisioterapeuta', 'admin'] as UserRole[]}>
        <PatientVisitListPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/patients/:patientId/visits',
    element: (
      <ProtectedRoute requiredRoles={['fisioterapeuta', 'admin'] as UserRole[]}>
        <PatientVisitListPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/patients/:patientId/visits/:visitId',
    element: (
      <ProtectedRoute requiredRoles={['fisioterapeuta', 'admin'] as UserRole[]}>
        <VisitDetailPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/patients/:patientId/visits/new',
    element: (
      <ProtectedRoute requiredRoles={['fisioterapeuta', 'admin'] as UserRole[]}>
        <StructuredVisitForm />
      </ProtectedRoute>
    )
  },
  {
    path: '/',
    element: (
      <ProtectedRoute requiredRoles={['fisioterapeuta', 'admin', 'auditor'] as UserRole[]}>
        <HomePage />
      </ProtectedRoute>
    )
  },
  {
    path: '*',
    element: <LoginPage />
  }
];

export default routes;

