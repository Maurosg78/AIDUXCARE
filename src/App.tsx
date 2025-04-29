import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@modules/emr/pages/LoginPage";
import ChatPage from "@modules/assistant/pages/ChatPage";
import PatientsPage from "@modules/emr/pages/PatientsPage";
import PatientDetailPage from "@modules/emr/pages/PatientDetailPage";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/assistant/chat" element={<ChatPage />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/patients/:id" element={<PatientDetailPage />} />
      </Routes>
    </Router>
  );
};

export default App;
