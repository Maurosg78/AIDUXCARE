import { createBrowserRouter } from 'react-router-dom';
import Layout from '@/core/components/Layout';
import DashboardRedirect from '@/pages/dashboard';
import DashboardProfessional from '@/pages/dashboard/professional';
import DashboardSecretary from '@/pages/dashboard/secretary';
import DashboardAdmin from '@/pages/dashboard/admin';
import DashboardDev from '@/pages/dashboard/dev';
import MockLogin from '@/pages/auth/MockLogin';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <MockLogin />
      },
      {
        path: '/dashboard',
        element: <DashboardRedirect />
      },
      {
        path: '/dashboard/professional',
        element: <DashboardProfessional />
      },
      {
        path: '/dashboard/secretary',
        element: <DashboardSecretary />
      },
      {
        path: '/dashboard/admin',
        element: <DashboardAdmin />
      },
      {
        path: '/dashboard/dev',
        element: <DashboardDev />
      }
      // ... otras rutas existentes
    ]
  }
]); 