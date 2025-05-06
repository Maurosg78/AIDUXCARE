/**
 * AiDuxCare es un copiloto clínico que se diferencia por:
 * 1. Evaluación en tiempo real de la calidad de las visitas
 * 2. Sugerencias contextuales basadas en evidencia clínica
 * 3. Detección temprana de omisiones o riesgos
 * 4. Integración con sistemas de trazabilidad para auditoría
 * 5. Interfaz adaptativa que se ajusta al flujo de trabajo clínico
 */

import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '@/core/context/AuthContext';
import HomePage from '@/modules/core/pages/HomePage';
import LoginPage from '@/pages/auth/login';
import DashboardPage from '@/pages/dashboard';
import VisitDetailPage from '@/modules/emr/pages/VisitDetailPage';
import PatientVisitListPage from '@/modules/emr/pages/PatientVisitListPage';
import PatientVisitCreatePage from '@/modules/emr/pages/PatientVisitCreatePage';
import NotFoundPage from '@/pages/404';
import MCPPage from '@/pages/mcp/[visitId]';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/auth/login',
    element: <LoginPage />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/visits',
    element: (
      <ProtectedRoute>
        <PatientVisitListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/visits/:visitId',
    element: (
      <ProtectedRoute>
        <VisitDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/mcp/:visitId',
    element: (
      <ProtectedRoute>
        <MCPPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/patients/:patientId/visits',
    element: (
      <ProtectedRoute>
        <PatientVisitListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/patients/:patientId/visits/new',
    element: (
      <ProtectedRoute>
        <PatientVisitCreatePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <NotFoundPage />,
  }
];

export default routes;

