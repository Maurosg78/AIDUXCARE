import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";
import { AuthProvider } from '@/core/context/AuthContext';
import { verifyLangfuseConfig } from "@/core/lib/langfuse.client";
import { router } from "./core/router/routes";
import "./styles/index.css";

// Verificación del entorno en desarrollo
if (import.meta.env.DEV) {
  // Verificar configuración de Langfuse
  verifyLangfuseConfig();
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
