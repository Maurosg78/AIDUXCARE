import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./modules/auth/pages/LoginPage";
import PatientListPage from "./modules/emr/pages/PatientListPage";
import PatientDetailPage from "./modules/emr/pages/PatientDetailPage";
import PatientNewPage from "./modules/emr/pages/PatientNewPage";
import PatientCreatePage from "./modules/emr/pages/PatientCreatePage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/assistant/patients" element={<PatientListPage />} />
        <Route path="/assistant/patients/new" element={<PatientNewPage />} />
        <Route path="/assistant/patient/:id" element={<PatientDetailPage />} />
        <Route path="*" element={<h2>404 - Página no encontrada</h2>} />
	<Route path="/assistant/patients/new" element={<PatientCreatePage />} />
      </Routes>
    </Router>
  );
};

export default App;

