import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";
import { AuthProvider } from '@/core/context/AuthContext';
import { verifyLangfuseConfig } from "@/core/lib/langfuse.client";
import { router } from "./core/router/routes";
import "./styles/index.css";

// Comprobar si estamos en desarrollo usando MODE
if (import.meta.env.MODE === 'development') {
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
