import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './core/context/AuthContext';
import RoleBasedRedirect from './core/components/RoleBasedRedirect';
import LoginPage from './pages/auth/login';
import ProfessionalDashboard from './modules/emr/pages/ProfessionalDashboard';
import VisitDetailPage from './modules/emr/pages/VisitDetailPage';
import DevTools from "./modules/emr/components/dev/DevTools";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<RoleBasedRedirect />} />
          <Route path="/professional/dashboard" element={<ProfessionalDashboard />} />
          <Route path="/visits/:visitId" element={<VisitDetailPage />} />
        </Routes>
      </Router>
      <DevTools />
    </AuthProvider>
  );
}

export default App;

