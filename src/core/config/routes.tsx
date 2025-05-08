/**
 * AiDuxCare es un copiloto clínico que se diferencia por:
 * 1. Evaluación en tiempo real de la calidad de las visitas
 * 2. Sugerencias contextuales basadas en evidencia clínica
 * 3. Detección temprana de omisiones o riesgos
 * 4. Integración con sistemas de trazabilidad para auditoría
 * 5. Interfaz adaptativa que se ajusta al flujo de trabajo clínico
 */

import { RouteObject, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/core/context/AuthContext';
import RecordsPage from '@/modules/emr/pages/RecordsPage';
import HomePage from '@/modules/core/pages/HomePage';
import LoginPage from '@/pages/auth/login';
import ProfessionalDashboard from '@/pages/professional/Dashboard';
import VisitDetailPage from '@/modules/emr/pages/VisitDetailPage';
import PatientVisitListPage from '@/modules/emr/pages/PatientVisitListPage';
import PatientVisitCreatePage from '@/modules/emr/pages/PatientVisitCreatePage';
import NotFoundPage from '@/pages/404';
import MCPPage from '@/pages/mcp/[visitId]';
import PatientListPage from '@/modules/emr/pages/PatientListPage';
import AuditLogViewerWithRouter from '@/components/audit/AuditLogViewer';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to="/auth/login" replace />,
  },
  {
    path: '/auth/login',
    element: <LoginPage />,
  },
  {
    path: '/professional/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['professional', 'fisioterapeuta']}>
        <ProfessionalDashboard />
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
    path: '/visits/:visitId/audit-log',
    element: (
      <ProtectedRoute>
        <AuditLogViewerWithRouter />
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
    path: '/patients',
    element: (
      <ProtectedRoute>
        <PatientListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/records',
    element: (
      <ProtectedRoute>
        <RecordsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <NotFoundPage />,
  }
];

export default routes;

