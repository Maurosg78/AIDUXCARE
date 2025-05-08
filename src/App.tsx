import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './core/context/AuthContext';
import RoleBasedRedirect from './core/components/RoleBasedRedirect';
import { ProtectedRoute } from './core/context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/auth/login';
import ProfessionalDashboard from './pages/professional/Dashboard';
import VisitDetailPage from './modules/emr/pages/VisitDetailPage';
import DevTools from "./modules/emr/components/dev/DevTools";
import PatientListPage from './pages/PatientListPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<RoleBasedRedirect />} />

          {/* Rutas protegidas dentro del layout */}
          <Route element={<Layout />}>
            {/* Dashboard del profesional */}
            <Route
              path="/professional/dashboard"
              element={
                <ProtectedRoute allowedRoles={['professional', 'fisioterapeuta']}>
                  <ProfessionalDashboard />
                </ProtectedRoute>
              }
            />

            {/* Rutas de pacientes */}
            <Route
              path="/patients"
              element={
                <ProtectedRoute allowedRoles={['professional', 'secretary', 'admin', 'fisioterapeuta']}>
                  <PatientListPage />
                </ProtectedRoute>
              }
            />

            {/* Lista de visitas */}
            <Route
              path="/visits"
              element={
                <ProtectedRoute allowedRoles={['professional', 'fisioterapeuta']}>
                  <div>Lista de Visitas</div>
                </ProtectedRoute>
              }
            />

            {/* Detalle de visita */}
            <Route
              path="/visits/:visitId"
              element={
                <ProtectedRoute allowedRoles={['professional', 'fisioterapeuta']}>
                  <VisitDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Registros médicos */}
            <Route
              path="/records"
              element={
                <ProtectedRoute allowedRoles={['professional', 'fisioterapeuta']}>
                  <div>Registros Médicos</div>
                </ProtectedRoute>
              }
            />

            {/* Dashboard del administrador */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <div>Panel de Administrador</div>
                </ProtectedRoute>
              }
            />

            {/* Dashboard del secretario */}
            <Route
              path="/secretary/dashboard"
              element={
                <ProtectedRoute allowedRoles={['secretary']}>
                  <div>Panel de Secretaría</div>
                </ProtectedRoute>
              }
            />

            {/* Ruta de fallback para dashboard */}
            <Route path="/dashboard" element={<RoleBasedRedirect />} />

            {/* Redirección del dashboard antiguo al nuevo */}
            <Route
              path="/dashboard"
              element={<Navigate to="/professional/dashboard" replace />}
            />
          </Route>
        </Routes>
      </Router>
      <DevTools />
    </AuthProvider>
  );
}

export default App;

