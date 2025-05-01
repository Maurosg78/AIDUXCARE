import React from 'react';
import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '../../context/AuthContext';
import LoginPage from '../../modules/auth/LoginPage';
import ImpactDashboard from '../../modules/dashboard/ImpactDashboard';
import { UserRole } from '../../modules/auth/authService';
import HomePage from "@/modules/core/pages/HomePage";
import PatientVisitListPage from "@/modules/emr/pages/PatientVisitListPage";
import VisitDetailPage from "@/modules/emr/pages/VisitDetailPage";

const routes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginPage />
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
    path: '/patients/:patientId/visits/:visitId',
    element: (
      <ProtectedRoute requiredRoles={['fisioterapeuta', 'admin'] as UserRole[]}>
        <VisitDetailPage />
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

