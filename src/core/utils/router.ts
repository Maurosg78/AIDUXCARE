/**
 * Adaptador para react-router-dom
 * 
 * Este archivo re-exporta los componentes y hooks de react-router-dom
 * para permitir que el código existente siga funcionando sin cambios.
 */

// Importamos primero lo que vamos a usar en definiciones de tipos

// Re-exportamos todo desde react-router-dom
export { 
  Routes, 
  Route, 
  Outlet, 
  useParams, 
  useNavigate, 
  useLocation, 
  Link, 
  Navigate, 
  createBrowserRouter, 
  RouterProvider
} from '@/core/utils/router';

// Re-exportamos tipos para mantener compatibilidad
export type {
  Params,
  Location,
  RouteObject
} from '@/core/utils/router';

// Definir los tipos que no existen en react-router-dom
export type NavigateFunction = ReturnType<typeof useNavigate>;
export interface NavigateOptions {
  replace?: boolean;
  state?: any;
}

// Exportación por defecto para mantener compatibilidad
import * as ReactRouter from '@/core/utils/router';
export default ReactRouter; 