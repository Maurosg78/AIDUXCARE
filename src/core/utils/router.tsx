/**
 * Utilidades para trabajar con React Router
 * Proporciona versiones wrapper para los componentes de navegación
 */

// Importamos React utilizando esModuleInterop
import * as React from 'react';
import type { ReactNode } from 'react';
import {
  Routes,
  Route,
  Navigate as ReactRouterNavigate,
  Outlet,
  useParams,
  useNavigate as useReactRouterNavigate,
  useLocation as useReactRouterLocation,
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import LinkComponent from '../router-compat/LinkComponent';
import type { LinkProps } from '../router-compat/LinkComponent';

// Definir el tipo de props para Navigate
export interface NavigateProps {
  to: string;
  replace?: boolean;
  state?: Record<string, unknown>;
}

// Re-exportar componentes básicos tal cual
export { Routes, Route, Outlet, useParams };
export { LinkComponent as Link };

// Componente para redireccionar (wrapper consistente)
export const Navigate: React.FC<NavigateProps> = props => {
  return React.createElement(ReactRouterNavigate, props);
};

// Re-exportamos LinkProps para uso en otras partes
export type { LinkProps };

// Hook para navegar (wrapper consistente)
export function useNavigate() {
  return useReactRouterNavigate();
}

// Hook para obtener la ubicación actual (wrapper consistente)
export function useLocation() {
  return useReactRouterLocation();
}

// Contenedor de layout (para layouts de ruta)
export function LayoutContainer({ children }: { children: ReactNode }) {
  return React.createElement('div', { className: 'layout-container' }, children);
}

// Re-exportar tipos
export type { RouteObject };

// Re-exportar funciones de creación de router
export { createBrowserRouter };

// Re-exportar RouterProvider
export { RouterProvider }; 