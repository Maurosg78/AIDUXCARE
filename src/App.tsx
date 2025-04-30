import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import PatientVisitCreatePage from "./modules/emr/pages/PatientVisitCreatePage";
import { DevTools } from "./modules/emr/components/dev/DevTools";
import LoginPage from "./modules/auth/pages/LoginPage";
import PatientListPage from "./modules/emr/pages/PatientListPage";
import PatientDetailPage from "./modules/emr/pages/PatientDetailPage";
import PatientNewPage from "./modules/emr/pages/PatientNewPage";
// import PatientCreatePage from "./modules/emr/pages/PatientCreatePage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/assistant/patient/:id/visits/new" element={<PatientVisitCreatePage />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/assistant/patients" element={<PatientListPage />} />
        <Route path="/assistant/patients/new" element={<PatientNewPage />} />
        <Route path="/assistant/patient/:id" element={<PatientDetailPage />} />
        <Route path="*" element={<h2>404 - Página no encontrada</h2>} />
      </Routes>
      <DevTools />
    </Router>
  );
};

export default App;

