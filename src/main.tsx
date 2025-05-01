import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, useRoutes } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import routes from "./core/config/routes";

function AppRouter() {
  const element = useRoutes(routes);
  return element;
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
