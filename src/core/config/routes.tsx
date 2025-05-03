import { RouteObject } from 'react-router-dom';
import { UserRole } from '@/modules/auth/authService';
import { lazy } from 'react';
import React from 'react';
import ProtectedLayout from '@/components/layouts/ProtectedLayout';

const Dashboard = lazy(() => import('@/pages/PublicImpactDashboard'));

function AdminLayout() {
  return <ProtectedLayout allowedRoles={[UserRole.ADMIN]}>{<></>}</ProtectedLayout>;
}
function DoctorLayout() {
  return <ProtectedLayout allowedRoles={[UserRole.DOCTOR]}>{<></>}</ProtectedLayout>;
}
function PatientLayout() {
  return <ProtectedLayout allowedRoles={[UserRole.PATIENT]}>{<></>}</ProtectedLayout>;
}

const LoginPage = lazy(() => import('@/pages/login'));
const UnauthorizedPage = lazy(() => import('@/pages/unauthorized'));

export const protectedRoutes: RouteObject[] = [
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/admin/*',
    element: <AdminLayout />,
    children: [],
  },
  {
    path: '/doctor/*',
    element: <DoctorLayout />,
    children: [],
  },
  {
    path: '/patient/*',
    element: <PatientLayout />,
    children: [],
  },
];

export const publicRoutes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
];

export const routes: RouteObject[] = [
  ...protectedRoutes,
  ...publicRoutes,
];

export default routes; 