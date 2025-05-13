import React from 'react';
import { createBrowserRouter, RouteObject } from '@/core/utils/router';
import Layout from '@/core/components/Layout';
import DashboardRedirect from '@/pages/dashboard';
import DashboardProfessional from '@/pages/dashboard/professional';
import DashboardSecretary from '@/pages/dashboard/secretary';
import DashboardAdmin from '@/pages/dashboard/admin';
import DashboardDev from '@/pages/dashboard/dev';
import LoginPage from '@/pages/auth/login';
import ProfessionalDashboard from '@/pages/professional/Dashboard';
import VisitDetailPage from '@/modules/emr/pages/VisitDetailPage';
import PatientListPage from '@/pages/PatientListPage';
import NotFoundPage from '@/pages/404';
import RoleBasedRedirect from '@/core/components/RoleBasedRedirect';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <RoleBasedRedirect allowedRoles={['admin', 'professional', 'secretary', 'developer', 'fisioterapeuta', 'guest', 'patient']}>
          <DashboardRedirect />
        </RoleBasedRedirect>
      },
      {
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'auth/login',
        element: <LoginPage />
      },
      {
        path: 'dashboard',
        element: <DashboardRedirect />
      },
      {
        path: 'dashboard/professional',
        element: <DashboardProfessional />
      },
      {
        path: 'dashboard/secretary',
        element: <DashboardSecretary />
      },
      {
        path: 'dashboard/admin',
        element: <DashboardAdmin />
      },
      {
        path: 'dashboard/dev',
        element: <DashboardDev />
      },
      {
        path: 'professional',
        element: <ProfessionalDashboard />
      },
      {
        path: 'visits/:visitId',
        element: <VisitDetailPage />
      },
      {
        path: 'patients',
        element: <PatientListPage />
      },
      {
        path: '*',
        element: <NotFoundPage />
      }
    ]
  }
];

export const router = createBrowserRouter(routes); 