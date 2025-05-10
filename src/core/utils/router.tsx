import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
  useParams,
  useLocation,
  Outlet,
  createBrowserRouter,
  RouterProvider,
  RouteObject
} from 'react-router-dom';

// Re-exportar hooks
export { useNavigate, useParams, useLocation };

// Re-exportar componentes
export { Link, Navigate, Outlet };

// Re-exportar tipos
export type { RouteObject };

// Re-exportar funciones de creación de router
export { createBrowserRouter };

// Re-exportar RouterProvider
export { RouterProvider }; 