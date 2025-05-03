import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './modules/auth/AuthContext';
import { ProtectedRoute } from './components/ui/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { EmrPage } from './pages/EmrPage';
import FeedbackForm from './modules/feedback/components/FeedbackForm';
import { UserRole } from './core/config/constants';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={[UserRole.PHYSIOTHERAPIST, UserRole.ADMIN]}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/emr"
            element={
              <ProtectedRoute allowedRoles={[UserRole.PHYSIOTHERAPIST]}>
                <EmrPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/feedback"
            element={
              <ProtectedRoute allowedRoles={[UserRole.PHYSIOTHERAPIST]}>
                <FeedbackForm />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

