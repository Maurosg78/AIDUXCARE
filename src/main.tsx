import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, useRoutes } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import routes from "./core/config/routes";

function AppRouter() {
  const element = useRoutes(routes);
  return element;
}

console.log('🔥 VITE_LANGFUSE_PUBLIC_KEY →', import.meta.env.VITE_LANGFUSE_PUBLIC_KEY);
console.log('🔥 VITE_LANGFUSE_SECRET_KEY →', import.meta.env.VITE_LANGFUSE_SECRET_KEY);
console.log('🔥 VITE_LANGFUSE_BASE_URL →', import.meta.env.VITE_LANGFUSE_BASE_URL);

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
