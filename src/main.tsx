import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, useRoutes } from "react-router-dom";
import { AuthProvider } from '@/core/context/AuthContext';
import routes from "@/core/config/routes";
import { verifyLangfuseConfig } from "@/core/lib/langfuse.client";

function AppRouter() {
  const element = useRoutes(routes);
  return element;
}

// Verificación del entorno en desarrollo
if (import.meta.env.DEV) {
  // Verificar configuración de Langfuse
  verifyLangfuseConfig();
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
